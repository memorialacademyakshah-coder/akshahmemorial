import { Client, Databases, Users, ID, Query } from "node-appwrite";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export async function POST(req) {

  try {

    // =========================
    // GET DATA
    // =========================

    const franchiseData = await req.json();

    console.log("FRANCHISE DATA:", franchiseData);

    if (!franchiseData) {
      throw new Error("No data received");
    }

    // =========================
    // CLEAN APPWRITE SYSTEM FIELDS
    // =========================

    const cleanReq = JSON.parse(JSON.stringify(franchiseData));

    delete cleanReq.$id;
    delete cleanReq.$sequence;
    delete cleanReq.$createdAt;
    delete cleanReq.$updatedAt;
    delete cleanReq.$permissions;
    delete cleanReq.$databaseId;
    delete cleanReq.$collectionId;

    // =========================
    // USER CHECK / CREATE
    // =========================

    let userId = "";

    try {

      const existingUsers = await users.list([
        Query.equal("email", cleanReq.email)
      ]);

      if (existingUsers.total > 0) {

        userId = existingUsers.users[0].$id;

        console.log("EXISTING USER:", userId);

      } else {

        console.log("CREATING USER...");

        const newUser = await users.create(
          ID.unique(),
          cleanReq.email,
          undefined,
          cleanReq.password,
          cleanReq.name
        );

        userId = newUser.$id;

        console.log("NEW USER:", userId);
      }

    } catch (userErr) {

      console.error("USER ERROR:", userErr);

      return NextResponse.json({
        success: false,
        error: "USER ERROR: " + userErr.message
      }, { status: 500 });

    }

    // =========================
    // QR CODE
    // =========================

    const newDocId = ID.unique();

    const verifyUrl =
      `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${newDocId}`;

    const qrCode = await QRCode.toDataURL(verifyUrl);

    // =========================
    // DATES
    // =========================

    const issueDate = new Date();

    const expiryDate = new Date();

    expiryDate.setFullYear(issueDate.getFullYear() + 1);

    // =========================
    // CREATE APPROVED DOCUMENT
    // =========================

    try {

      console.log("CREATING APPROVED DOCUMENT...");

      const createdDoc = await databases.createDocument(
        DATABASE_ID,
        "franchise_approved",
        newDocId,
        {
          ...cleanReq,

          requestId: franchiseData.$id,

          instituteName: cleanReq.instituteName || "",
          email: cleanReq.email || "",
          password: cleanReq.password || "",
          name: cleanReq.name || "",

          userId,

          qrCode,
          verifyUrl,

          wallet: cleanReq.wallet || "0.00",
          courierWallet: cleanReq.courierWallet || "0.00",

          issueDate: issueDate.toISOString(),
          expiryDate: expiryDate.toISOString()
        }
      );

      console.log("APPROVED CREATED:", createdDoc.$id);

    } catch (createErr) {

      console.error("CREATE DOCUMENT ERROR:", createErr);

      return NextResponse.json({
        success: false,
        error: "CREATE ERROR: " + createErr.message
      }, { status: 500 });

    }

    // =========================
    // DELETE PENDING DOCUMENT
    // =========================

    try {

      console.log("DELETING PENDING DOCUMENT...");

      await databases.deleteDocument(
        DATABASE_ID,
        "franchise_requests",
        franchiseData.$id
      );

      console.log("PENDING DOCUMENT DELETED");

    } catch (deleteErr) {

      console.error("DELETE ERROR:", deleteErr);

      // TEMPORARY:
      // don't fail approval if delete fails

      console.log("DELETE SKIPPED");
    }

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,
      userId
    });

  } catch (err) {

    console.error("FINAL APPROVE ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message || "Approval failed"
    }, {
      status: 500
    });

  }

}
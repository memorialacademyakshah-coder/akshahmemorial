import { Client, Databases, Users, ID } from "node-appwrite";
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
    // GET REQUEST DATA
    // =========================

    const franchiseData = await req.json();

    console.log("FRANCHISE DATA:", franchiseData);

    if (!franchiseData) {
      throw new Error("No franchise data received");
    }

    // =========================
    // REMOVE APPWRITE SYSTEM FIELDS
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
    // CREATE / HANDLE USER
    // =========================

    let userId = "";

    try {

      console.log("CREATING AUTH USER...");

      const newUser = await users.create(
        ID.unique(),
        cleanReq.email.trim().toLowerCase(),
        undefined,
        cleanReq.password,
        cleanReq.name
      );

      userId = newUser.$id;

      console.log("NEW USER CREATED:", userId);

    } catch (userErr) {

      console.log("USER CREATE ERROR:", userErr.message);

      // IF USER ALREADY EXISTS
      // CONTINUE WITHOUT FAILING

      userId = "existing-user";
    }

    // =========================
    // GENERATE NEW DOC ID
    // =========================

    const newDocId = ID.unique();

    // =========================
    // GENERATE QR
    // =========================

    const verifyUrl =
      `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${newDocId}`;

    const qrCode = await QRCode.toDataURL(verifyUrl);

    // =========================
    // ISSUE / EXPIRY DATE
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

      console.log("APPROVED DOCUMENT CREATED:", createdDoc.$id);

    } catch (createErr) {

      console.error("CREATE DOCUMENT ERROR:", createErr);

      return NextResponse.json({
        success: false,
        error: "CREATE ERROR: " + createErr.message
      }, {
        status: 500
      });

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

      // DON'T FAIL APPROVAL
      // IF DELETE FAILS

      console.log("DELETE SKIPPED");
    }

    // =========================
    // SUCCESS RESPONSE
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
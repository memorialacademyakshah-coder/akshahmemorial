import { Client, Databases, ID } from "node-appwrite";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export async function POST(req) {

  try {

    // =========================
    // GET DATA
    // =========================

    const franchiseData = await req.json();

    console.log("FRANCHISE DATA:", franchiseData);

    if (!franchiseData) {
      throw new Error("No franchise data received");
    }

    // =========================
    // CLEAN DATA
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
    // GENERATE NEW DOC ID
    // =========================

    const newDocId = ID.unique();

    // =========================
    // QR CODE
    // =========================

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

        // TEMP USER PLACEHOLDER
        userId: "manual-user",

        qrCode,
        verifyUrl,

        wallet: cleanReq.wallet || "0.00",
        courierWallet: cleanReq.courierWallet || "0.00",

        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString()
      }
    );

    console.log("APPROVED CREATED:", createdDoc.$id);

    // =========================
    // DELETE PENDING
    // =========================

    try {

      await databases.deleteDocument(
        DATABASE_ID,
        "franchise_requests",
        franchiseData.$id
      );

      console.log("PENDING DELETED");

    } catch (deleteErr) {

      console.log("DELETE SKIPPED:", deleteErr.message);

    }

    return NextResponse.json({
      success: true
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
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
    // GET REQUEST BODY
    // =========================

    const franchiseData = await req.json();

    console.log("FRANCHISE DATA:", franchiseData);

    // =========================
    // VALIDATION
    // =========================

    if (!franchiseData) {
      throw new Error("No franchise data received");
    }

    if (!franchiseData.instituteName) {
      throw new Error("Institute name missing");
    }

    if (!franchiseData.email) {
      throw new Error("Email missing");
    }

    if (!franchiseData.password) {
      throw new Error("Password missing");
    }

    // =========================
    // REMOVE APPWRITE SYSTEM FIELDS
    // =========================

    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...cleanReq
    } = franchiseData;

    // =========================
    // CHECK EXISTING USER
    // =========================

    console.log("Checking existing user...");

    const existingUsers = await users.list([
      Query.equal("email", cleanReq.email)
    ]);

    let userId = "";

    // =========================
    // USER EXISTS
    // =========================

    if (existingUsers.total > 0) {

      userId = existingUsers.users[0].$id;

      console.log("Existing user found:", userId);

      // OPTIONAL → update password
      try {

        await users.updatePassword(
          userId,
          cleanReq.password
        );

        console.log("Password updated");

      } catch (passErr) {

        console.log("Password update skipped:", passErr.message);

      }

    } else {

      // =========================
      // CREATE NEW USER
      // =========================

      console.log("Creating new auth user...");

      const newUser = await users.create(
        ID.unique(),
        cleanReq.email,
        undefined,
        cleanReq.password,
        cleanReq.name
      );

      userId = newUser.$id;

      console.log("New user created:", userId);
    }

    // =========================
    // QR GENERATION
    // =========================

    const verifyUrl =
      `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${$id}`;

    const qrCode = await QRCode.toDataURL(verifyUrl);

    // =========================
    // ISSUE & EXPIRY DATE
    // =========================

    const issueDate = new Date();

    const expiryDate = new Date();

    expiryDate.setFullYear(issueDate.getFullYear() + 1);

    // =========================
    // CREATE APPROVED DOCUMENT
    // =========================

    console.log("Creating approved franchise document...");

    await databases.createDocument(
      DATABASE_ID,
      "franchise_approved",
      $id,
      {
        ...cleanReq,

        // REQUIRED
        instituteName: cleanReq.instituteName,
        email: cleanReq.email,
        password: cleanReq.password,
        name: cleanReq.name,

        // USER
        userId,

        // QR
        qrCode,
        verifyUrl,

        // WALLET
        wallet: cleanReq.wallet || "0.00",
        courierWallet: cleanReq.courierWallet || "0.00",

        // DATES
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),

    
      }
    );

    console.log("Approved document created");

    // =========================
    // DELETE FROM PENDING
    // =========================

    await databases.deleteDocument(
      DATABASE_ID,
      "franchise_requests",
      $id
    );

    console.log("Pending request deleted");

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      userId
    });

  } catch (err) {

    console.error("APPROVE API ERROR FULL:", err);

    return NextResponse.json({
      success: false,
      error: err.message || "Approval failed"
    }, {
      status: 500
    });

  }
}
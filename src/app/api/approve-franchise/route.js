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

    const franchiseData = await req.json();

    const cleanReq = JSON.parse(JSON.stringify(franchiseData));

    delete cleanReq.$id;
    delete cleanReq.$sequence;
    delete cleanReq.$createdAt;
    delete cleanReq.$updatedAt;
    delete cleanReq.$permissions;
    delete cleanReq.$databaseId;
    delete cleanReq.$collectionId;

    const newDocId = ID.unique();

    const verifyUrl =
      `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${newDocId}`;

    const qrCode = await QRCode.toDataURL(verifyUrl);

    const issueDate = new Date();

    const expiryDate = new Date();

    expiryDate.setFullYear(issueDate.getFullYear() + 1);

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

        userId: "manual-user",

        qrCode,
        verifyUrl,

        wallet: cleanReq.wallet || "0.00",
        courierWallet: cleanReq.courierWallet || "0.00",

        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString()
      }
    );

    return NextResponse.json({
      success: true,
      approvedId: createdDoc.$id
    });

  } catch (err) {

    console.error("FINAL APPROVE ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message
    });

  }

}
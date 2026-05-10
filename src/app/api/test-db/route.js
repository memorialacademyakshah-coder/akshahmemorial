import { Client, Databases, ID } from "node-appwrite";
import { NextResponse } from "next/server";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export async function GET() {

  try {

    const res = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      "franchise_approved",
      ID.unique(),
      {
        instituteName: "TEST",
        name: "TEST",
        email: "test@test.com",
        password: "12345678",
        userId: "test",
        wallet: "0.00",
        courierWallet: "0.00",
        issueDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(),
        qrCode: "test",
        verifyUrl: "test"
      }
    );

    return NextResponse.json({
      success: true,
      data: res
    });

  } catch (err) {

    console.error("TEST DB ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message
    });

  }

}
import { Client, Databases } from "node-appwrite";
import { NextResponse } from "next/server";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export async function POST(req) {

  try {

    const body = await req.json();

    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...cleanReq
    } = body;

    await databases.createDocument(
      DATABASE_ID,
      "franchise_rejected",
      $id,
      cleanReq
    );

    await databases.deleteDocument(
      DATABASE_ID,
      "franchise_requests",
      $id
    );

    return NextResponse.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });

  }
}
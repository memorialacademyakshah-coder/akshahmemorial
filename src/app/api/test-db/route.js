import { Client, Databases } from "node-appwrite";
import { NextResponse } from "next/server";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export async function GET() {

  try {

    // LIST DATABASES TEST
    const db = await databases.get(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
    );

    return NextResponse.json({
      success: true,
      db
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json({
      success: false,
      error: err.message
    });

  }

}
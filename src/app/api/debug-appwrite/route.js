import { Client, Databases } from "node-appwrite";
import { NextResponse } from "next/server";

export async function GET() {

  try {

    console.log("ENDPOINT:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log("PROJECT:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log("DATABASE:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    console.log("KEY:", process.env.APPWRITE_API_KEY);

    const client = new Client();

    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      "franchise_requests"
    );

    return NextResponse.json({
      success: true,
      total: result.total,
      docs: result.documents
    });

  } catch (err) {

    console.error("DEBUG ERROR:", err);
    

    return NextResponse.json({
      success: false,
      error: err.message,
      full: JSON.stringify(err)
    });

  }

}
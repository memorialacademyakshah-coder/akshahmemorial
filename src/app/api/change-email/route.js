import { NextResponse } from "next/server";
import { Client, Users } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

export async function POST(req) {

  try {

    const body = await req.json();

    const { userId, email } = body;

    await users.updateEmail(
      userId,
      email
    );

    return NextResponse.json({
      success: true
    });

  } catch (error) {

    console.log("CHANGE EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );

  }

}
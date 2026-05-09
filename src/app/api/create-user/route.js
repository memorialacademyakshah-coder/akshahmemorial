import { Client, Users, ID, Query } from "node-appwrite";
import { NextResponse } from "next/server";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

export async function POST(req) {
  try {
    const body = await req.json();

    const { email, password } = body;

    // ✅ CHECK EXISTING USER
    const existingUsers = await users.list([
      Query.equal("email", email)
    ]);

    // ✅ IF USER EXISTS
    if (existingUsers.total > 0) {
      return NextResponse.json({
        success: true,
        userId: existingUsers.users[0].$id
      });
    }

    // ✅ CREATE NEW USER
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      password
    );

    return NextResponse.json({
      success: true,
      userId: newUser.$id
    });

  } catch (err) {

    console.error("CREATE USER ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });

  }
}
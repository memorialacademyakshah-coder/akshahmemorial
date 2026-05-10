import { NextResponse } from "next/server";

export async function GET() {

  return NextResponse.json({
    hasKey: !!process.env.APPWRITE_API_KEY,
    keyStart: process.env.APPWRITE_API_KEY
      ? process.env.APPWRITE_API_KEY.slice(0, 20)
      : null
  });

}
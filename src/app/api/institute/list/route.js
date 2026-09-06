// src/app/api/institute/list/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    // Fetch only Institutes (role="institute") and return their Names & ID
    const institutes = await User.find({ role: "institute" }).select("name _id usn");
    return NextResponse.json({ institutes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching institutes" }, { status: 500 });
  }
}
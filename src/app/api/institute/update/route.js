import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, name, usn } = await req.json();

    // 1. Connect to Database
    await connectDB();

    // 2. Find the institute by email and update their Name/USNs
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { name, usn }, // The new data
      { new: true }  // Return the updated user so the dashboard updates immediately
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "Institute not found" }, { status: 404 });
    }

    // 3. Send back the success message and new data
    return NextResponse.json({ 
      message: "Profile Updated", 
      user: { name: updatedUser.name, email: updatedUser.email, usn: updatedUser.usn } 
    }, { status: 200 });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json({ message: "Update Failed", error: error.message }, { status: 500 });
  }
}
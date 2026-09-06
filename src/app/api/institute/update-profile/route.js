import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { 
      userId, 
      name, 
      usn, 
      teacherIdFormat, 
      psychologistIdFormat 
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required for update." }, { status: 400 });
    }

    await connectDB();

    // Find the Institute user and update the fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        usn,
        teacherIdFormat,
        psychologistIdFormat,
      },
      { new: true, runValidators: true } // {new: true} returns the updated document
    ).select("-password"); // Don't return the password hash

    if (!updatedUser) {
      return NextResponse.json({ message: "Institute not found." }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Profile updated successfully.", 
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
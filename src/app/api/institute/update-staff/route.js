import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { staffId, name } = await req.json();

    if (!staffId || !name) {
      return NextResponse.json({ message: "Staff ID and name are required for update." }, { status: 400 });
    }

    await connectDB();

    // Find the staff user by ID and update the name field
    const updatedStaff = await User.findByIdAndUpdate(
      staffId,
      { name: name }, // Only update the name field
      { new: true, runValidators: true } // Return the updated document
    ).select("-password"); // Exclude password hash from the response

    if (!updatedStaff) {
      return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Staff details updated successfully.", 
      staff: updatedStaff 
    }, { status: 200 });

  } catch (error) {
    console.error("STAFF UPDATE ERROR:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
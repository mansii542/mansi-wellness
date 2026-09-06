import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { staffId } = await req.json();

    if (!staffId) {
      return NextResponse.json({ message: "Staff ID is required." }, { status: 400 });
    }

    await connectDB();

    // Delete the user by their unique ID
    const result = await User.findByIdAndDelete(staffId);

    if (!result) {
      return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Staff member deleted successfully." }, { status: 200 });

  } catch (error) {
    console.error("DELETE STAFF ERROR:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
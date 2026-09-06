import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ message: "Student ID is required." }, { status: 400 });
    }

    await connectDB();

    const result = await User.findByIdAndDelete(studentId);

    if (!result) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}



import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // Institute ID

    if (!id) {
      return NextResponse.json({ message: "Institute ID is required." }, { status: 400 });
    }

    await connectDB();

    // Fetch Institute details, including the student whitelist count
    const institute = await User.findById(id).select("name studentWhitelist");

    if (!institute) {
      return NextResponse.json({ message: "Institute not found." }, { status: 404 });
    }

    return NextResponse.json({ institute }, { status: 200 });

  } catch (error) {
    console.error("INSTITUTE DETAILS ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
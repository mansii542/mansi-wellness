import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    
    // This command deletes the specific "authId" rule that is crashing your app
    try {
      await User.collection.dropIndex("authId_1");
      return NextResponse.json({ message: "✅ SUCCESS! The bad rule 'authId_1' was deleted. You can now create staff." });
    } catch (e) {
      return NextResponse.json({ message: "⚠️ Notice: Rule not found. It might already be gone.", error: e.message });
    }

  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
// src/app/api/chat/tag-session/route.js - COMPLETE CODE
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ChatSession from "@/models/ChatSession";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const { sessionId, issueTags, status = 'Active' } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ message: "Invalid session ID format." }, { status: 400 });
    }

    if (!issueTags || !Array.isArray(issueTags)) {
      return NextResponse.json({ message: "Issue tags array is required." }, { status: 400 });
    }
    
    await connectDB();

    // Find the session and update the issueTags array and status
    const updatedSession = await ChatSession.findByIdAndUpdate(
      sessionId,
      { 
        issueTags: issueTags, 
        status: status 
      },
      { new: true, runValidators: true } // Run validators to ensure tags are valid ENUM values
    ).select("issueTags status");

    if (!updatedSession) {
      return NextResponse.json({ message: "Chat session not found." }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Session tags and status updated successfully for wellness analysis.", 
      issueTags: updatedSession.issueTags,
      status: updatedSession.status
    }, { status: 200 });

  } catch (error) {
    console.error("TAG SESSION ERROR:", error);
    // Log validation error details if tags are invalid
    if (error.name === 'ValidationError') {
        return NextResponse.json({ message: "Invalid tag provided. Please check the allowed list." }, { status: 400 });
    }
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
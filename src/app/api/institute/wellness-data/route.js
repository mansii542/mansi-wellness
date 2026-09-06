// src/app/api/institute/wellness-data/route.js - COMPLETE CODE
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ChatSession from "@/models/ChatSession";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get("id");

    if (!mongoose.Types.ObjectId.isValid(instituteId)) {
      return NextResponse.json({ message: "Invalid Institute ID format." }, { status: 400 });
    }
    
    await connectDB();

    // --- MongoDB Aggregation Pipeline for Anonymous Wellness Data ---
    const pipeline = [
      // 1. Filter sessions by the required institute ID
      {
        $match: {
          instituteId: new mongoose.Types.ObjectId(instituteId),
          issueTags: { $exists: true, $ne: [] } // Only count sessions that have been tagged
        }
      },
      // 2. Unwind the issueTags array to create a separate document for each tag
      { $unwind: "$issueTags" },
      // 3. Group by tag and priority level to count occurrences
      {
        $group: {
          _id: {
            tag: "$issueTags",
            priority: { $arrayElemAt: ["$messages.priority", 0] } // Get the priority from the first message/status
          },
          count: { $sum: 1 }
        }
      },
      // 4. Reshape the output to group priority counts under each tag
      {
        $group: {
          _id: "$_id.tag",
          totalSessions: { $sum: "$count" },
          priorities: {
            $push: {
              priority: "$_id.priority",
              count: "$count"
            }
          }
        }
      },
      // 5. Final projection to rename _id to tag
      {
        $project: {
          _id: 0,
          issueTag: "$_id",
          totalSessions: 1,
          priorities: 1
        }
      }
    ];

    const wellnessData = await ChatSession.aggregate(pipeline);

    return NextResponse.json({ 
        message: "Wellness data aggregated successfully.", 
        data: wellnessData 
    }, { status: 200 });

  } catch (error) {
    console.error("GET WELLNESS DATA ERROR:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
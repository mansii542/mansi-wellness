// src/app/api/institute/tag-session/route.js - COMPLETE CODE (Final Tagging Logic)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatSession from '@/models/ChatSession'; // Assuming this model exists

/**
 * @method POST
 * @description Updates a chat session with counselor-defined tags and priority.
 * This action ensures that the session data is ready for wellness reporting.
 */
export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const { sessionId, issueTags, counselorId, priority } = body;

        if (!sessionId || !issueTags || !counselorId || !priority) {
            return NextResponse.json({ message: 'Missing required fields: sessionId, issueTags, counselorId, and priority.' }, { status: 400 });
        }

        // 1. Update the ChatSession document
        const session = await ChatSession.findByIdAndUpdate(
            sessionId,
            {
                $set: {
                    issueTags: issueTags,
                    counselorId: counselorId,
                    counselorPriority: priority,
                    taggedAt: new Date(),
                    // Mark as 'reviewed' to distinguish from unassigned chats in the inbox
                    status: 'reviewed', 
                },
                // Add the counselor to the participants list if not already there
                $addToSet: {
                    participants: counselorId,
                }
            },
            { new: true } // Return the updated document
        );

        if (!session) {
            return NextResponse.json({ message: 'Chat session not found.' }, { status: 404 });
        }

        // 2. Return success
        return NextResponse.json({ message: 'Session successfully tagged and updated.', session }, { status: 200 });

    } catch (error) {
        console.error('Session Tagging Error:', error);
        return NextResponse.json({ message: 'Internal server error during session tagging.' }, { status: 500 });
    }
}
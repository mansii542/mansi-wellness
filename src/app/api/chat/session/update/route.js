import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function POST(req) {
    await dbConnect();

    try {
        const { sessionId, severity, problemType, isReported } = await req.json();

        // Build the update object dynamically
        // We only update the fields that are actually sent
        const updateData = {};
        if (severity) updateData.severity = severity;
        if (problemType) updateData.problemType = problemType;
        if (isReported !== undefined) updateData.isReported = isReported;
        
        // Always update the timestamp so the session stays active
        updateData.updatedAt = new Date();

        // Update the Session in the database
        const session = await Session.findByIdAndUpdate(
            sessionId,
            updateData,
            { new: true } // Return the updated document so the UI updates instantly
        );

        return NextResponse.json({ session }, { status: 200 });

    } catch (error) {
        console.error("Update Session Error:", error);
        return NextResponse.json({ message: 'Update failed' }, { status: 500 });
    }
}
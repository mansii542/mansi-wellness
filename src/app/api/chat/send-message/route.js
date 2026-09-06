import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Session from '@/models/Session';

export async function POST(req) {
    await dbConnect();
    try {
        const { sessionId, senderId, content } = await req.json();

        // Validate
        if (!sessionId || !senderId || !content) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // 1. Save Message (senderId is now a String, so USNs work)
        const message = await Message.create({
            sessionId,
            senderId,
            content,
            timestamp: new Date()
        });

        // 2. Update Session Timer
        // This resets the 7-day countdown whenever a new message is sent
        await Session.findByIdAndUpdate(sessionId, { 
            updatedAt: new Date() 
        });

        return NextResponse.json({ message }, { status: 200 });

    } catch (error) {
        console.error("Send Msg Error:", error);
        return NextResponse.json({ message: 'Failed to send' }, { status: 500 });
    }
}
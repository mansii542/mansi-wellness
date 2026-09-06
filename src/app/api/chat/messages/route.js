import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET(req) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ messages: [] }, { status: 200 });
        }

        // Fetch messages for this session, sorted by time (Oldest -> Newest)
        const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });

        return NextResponse.json({ messages }, { status: 200 });

    } catch (error) {
        console.error("Fetch Messages Error:", error);
        return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export const dynamic = 'force-dynamic'; // Ensure real-time updates

export async function GET(req) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ sessions: [] }, { status: 200 });
        }

        // Find any active session where this user is involved
        // They could be the 'starter' (Student) OR the 'counselor' (Doctor)
        const sessions = await Session.find({
            $or: [
                { starterId: userId },
                { counselorId: userId }
            ],
            status: 'active'
        })
        .sort({ updatedAt: -1 }); // Show newest chats at the top

        return NextResponse.json({ sessions }, { status: 200 });

    } catch (error) {
        console.error("Inbox Error:", error);
        return NextResponse.json({ sessions: [] }, { status: 200 });
    }
}
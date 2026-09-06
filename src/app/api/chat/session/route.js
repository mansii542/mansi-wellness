import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const { starterId, counselorId } = body;

        console.log("--- CREATE SESSION REQUEST ---");
        console.log("Starter ID:", starterId);
        console.log("Counselor ID:", counselorId);

        // 1. Validation
        if (!starterId || !counselorId) {
            console.error("FAIL: Missing IDs");
            return NextResponse.json({ message: 'Starter ID and Counselor ID are required' }, { status: 400 });
        }

        // 2. Check for existing active session
        // We match Strings now, so USN vs USN works perfectly.
        let session = await Session.findOne({
            starterId: starterId,
            counselorId: counselorId,
            status: 'active'
        });

        // 3. Create if not found
        if (!session) {
            console.log("Creating NEW session...");
            session = await Session.create({
                starterId,
                counselorId,
                status: 'active',
                isAnonymous: true,
                severity: 'Pending'
            });
        } else {
            console.log("Found EXISTING session:", session._id);
        }

        return NextResponse.json({ session }, { status: 200 });

    } catch (error) {
        console.error("Create Session Error:", error);
        return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
    }
}
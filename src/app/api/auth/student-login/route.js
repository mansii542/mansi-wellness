import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
    await dbConnect();

    try {
        const { name, usn, instituteId } = await req.json();

        // 1. Check all required fields (No password needed)
        if (!name || !usn || !instituteId) {
            return NextResponse.json({ message: 'Institute, Name, and USN are required' }, { status: 400 });
        }

        // 2. Find User by USN and Institute
        // We ensure the student exists in that specific institute
        const user = await User.findOne({ 
            usn: usn,
            instituteId: instituteId,
            role: 'student' // Explicitly check role
        });

        if (!user) {
            return NextResponse.json({ message: 'Student ID (USN) not found in this institute.' }, { status: 401 });
        }

        // 3. Verify Name (Case-insensitive check)
        // This acts as the "security" layer - they must know exactly how their name is registered
        if (user.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
            return NextResponse.json({ message: 'Name does not match our records for this USN.' }, { status: 401 });
        }

        // 4. Success (No password check)
        return NextResponse.json({ 
            message: 'Login successful', 
            user: {
                _id: user._id,
                name: user.name,
                role: 'student',
                usn: user.usn,
                instituteId: user.instituteId,
                instituteName: user.instituteName
            } 
        }, { status: 200 });

    } catch (error) {
        console.error("Student Login Error:", error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs'; // Imported successfully now!

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const inputId = body.staffId || body.loginId; 
        const { password, instituteId } = body;

        if (!inputId || !password || !instituteId) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // 1. Find User & Get Password
        const user = await User.findOne({ 
            $or: [{ staffId: inputId }, { loginId: inputId }, { email: inputId }]
        }).select('+password'); 

        if (!user) {
            return NextResponse.json({ message: 'User ID not found' }, { status: 401 });
        }

        // 2. Check Institute
        if (String(user.instituteId) !== String(instituteId)) {
            return NextResponse.json({ message: 'Wrong Institute selected' }, { status: 401 });
        }

        // 3. Check Role
        const role = user.role ? user.role.toLowerCase() : '';
        if (!['teacher', 'psychologist', 'counselor'].includes(role)) {
            return NextResponse.json({ message: 'Not a staff account' }, { status: 403 });
        }

        // 4. PASSWORD CHECK (Secure)
        let isValid = false;

        // Check A: Is it a Hashed Password? (Starts with $2b$)
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            isValid = await bcrypt.compare(password, user.password); // Unhash and check
        } 
        // Check B: Is it a Plain Text Password? (For legacy/test accounts)
        else {
            isValid = (user.password === password);
        }

        if (!isValid) {
            console.log("❌ Password Mismatch for:", inputId);
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // 5. Success
        return NextResponse.json({ 
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                role: user.role,
                instituteId: user.instituteId,
                staffId: user.staffId || user.loginId
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
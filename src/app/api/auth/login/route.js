import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    await dbConnect();
    
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password required.' }, { status: 400 });
        }

        // Find Institute by Email
        const user = await User.findOne({ 
            email: email.toLowerCase().trim(),
            role: 'institute' 
        }).select('+password');

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        // Return User Data
        const userData = user.toObject();
        delete userData.password;

        return NextResponse.json({ 
            message: 'Login successful', 
            user: userData 
        }, { status: 200 });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
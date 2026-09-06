import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
    try {
        const { name, email, password, confirmPassword } = await req.json();

        // 1. Validation
        if (!name || !email || !password || !confirmPassword) {
            return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ message: 'Passwords do not match.' }, { status: 400 });
        }

        await dbConnect();

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists.' }, { status: 400 });
        }

        // 3. Create the Institute Account
        // CRITICAL: We save the role as 'admin' so it shows up in the "Select Institute" list.
        const user = await User.create({
            name,
            email,
            password, 
            role: 'admin' 
        });

        return NextResponse.json({ 
            message: 'Institute registered successfully!',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ message: 'Server error during registration.' }, { status: 500 });
    }
}
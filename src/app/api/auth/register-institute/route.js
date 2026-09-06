import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    await dbConnect();
    
    try {
        const { name, email, password } = await req.json();

        // 1. Validation
        if (!name || !email || !password) {
            return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
        }

        // 2. Check if Institute already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return NextResponse.json({ message: 'Email already registered.' }, { status: 400 });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create Institute User
        // Note: We don't set 'instituteId' because the Institute is its own entity
        await User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'institute',
            status: 'active'
        });

        return NextResponse.json({ message: 'Institute registered successfully.' }, { status: 201 });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
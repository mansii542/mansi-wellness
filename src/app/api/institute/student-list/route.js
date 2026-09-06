import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get('instituteId');

    if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId)) {
        return NextResponse.json({ students: [], message: 'Invalid instituteId' }, { status: 400 });
    }

    const instituteObjectId = new mongoose.Types.ObjectId(instituteId);

    try {
        const students = await User.find({ instituteId: instituteObjectId, role: 'student' }).sort({ createdAt: -1 });
        return NextResponse.json({ students }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ students: [] }, { status: 500 });
    }
}
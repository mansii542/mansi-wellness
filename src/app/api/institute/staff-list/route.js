import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get('instituteId');

    if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId)) {
        return NextResponse.json({ staff: [], message: 'Invalid instituteId' }, { status: 400 });
    }

    const instituteObjectId = new mongoose.Types.ObjectId(instituteId);

    try {
        const staff = await User.find({ 
            instituteId: instituteObjectId, 
            role: { $in: ['teacher', 'psychologist'] } 
        }).sort({ createdAt: -1 });
        return NextResponse.json({ staff }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ staff: [] }, { status: 500 });
    }
}
// src/app/api/student/risk-profile/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RiskProfile from '@/models/RiskProfile';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return NextResponse.json({ profile: null }, { status: 200 });
        }

        const profile = await RiskProfile.findOne({
            studentId: new mongoose.Types.ObjectId(studentId)
        }).lean();

        return NextResponse.json({ profile: profile || null }, { status: 200 });
    } catch (error) {
        console.error('Risk Profile GET Error:', error);
        return NextResponse.json({ profile: null }, { status: 200 });
    }
}

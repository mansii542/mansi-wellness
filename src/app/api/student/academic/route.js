// src/app/api/student/academic/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AcademicRecord from '@/models/AcademicRecord';
import User from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return NextResponse.json({ records: [] }, { status: 200 });
        }

        const records = await AcademicRecord.find({ studentId: new mongoose.Types.ObjectId(studentId) })
            .sort({ semester: 1 })
            .lean();

        return NextResponse.json({ records }, { status: 200 });

    } catch (error) {
        console.error('Student Academic API Error:', error);
        return NextResponse.json({ records: [] }, { status: 200 });
    }
}

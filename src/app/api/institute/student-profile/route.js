// src/app/api/institute/student-profile/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AcademicRecord from '@/models/AcademicRecord';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return NextResponse.json({ message: 'Invalid student ID.' }, { status: 400 });
        }

        const student = await User.findById(studentId).select('-password').lean();
        if (!student || student.role !== 'student') {
            return NextResponse.json({ message: 'Student not found.' }, { status: 404 });
        }

        // Fetch all academic records for this student, sorted by semester
        const academicRecords = await AcademicRecord.find({ studentId: student._id })
            .sort({ semester: 1 })
            .lean();

        return NextResponse.json({ student, academicRecords }, { status: 200 });

    } catch (error) {
        console.error('Student Profile Error:', error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}

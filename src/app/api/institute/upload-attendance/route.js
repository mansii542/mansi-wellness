// src/app/api/institute/upload-attendance/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AcademicRecord from '@/models/AcademicRecord';
import mongoose from 'mongoose';

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const { instituteId, semester, academicYear, entries } = body;
        // entries: [{ usn, subjects: [{ name, attendancePresent, attendanceTotal }] }]

        if (!instituteId || !semester || !academicYear || !entries?.length) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(instituteId)) {
            return NextResponse.json({ message: 'Invalid institute ID.' }, { status: 400 });
        }

        const instObjId = new mongoose.Types.ObjectId(instituteId);
        let updatedCount = 0;
        const errors = [];

        for (const entry of entries) {
            try {
                const { usn, subjects } = entry;
                if (!usn || !subjects?.length) {
                    errors.push(`Row skipped: missing USN or subjects.`);
                    continue;
                }

                const student = await User.findOne({
                    usn: usn.toUpperCase().trim(),
                    instituteId: instObjId,
                    role: 'student',
                });

                if (!student) {
                    errors.push(`USN ${usn}: Student not found in this institute.`);
                    continue;
                }

                const existing = await AcademicRecord.findOne({
                    studentId: student._id,
                    semester: Number(semester),
                    academicYear,
                });

                if (existing) {
                    for (const sub of subjects) {
                        const idx = existing.subjects.findIndex(s => s.name.toLowerCase() === sub.name.toLowerCase());
                        if (idx > -1) {
                            existing.subjects[idx].attendancePresent = sub.attendancePresent;
                            existing.subjects[idx].attendanceTotal = sub.attendanceTotal;
                        } else {
                            existing.subjects.push({
                                name: sub.name,
                                attendancePresent: sub.attendancePresent,
                                attendanceTotal: sub.attendanceTotal,
                            });
                        }
                    }
                    existing.markModified('subjects');
                    await existing.save();
                } else {
                    await AcademicRecord.create({
                        studentId: student._id,
                        instituteId: instObjId,
                        semester: Number(semester),
                        academicYear,
                        subjects: subjects.map(s => ({
                            name: s.name,
                            attendancePresent: s.attendancePresent,
                            attendanceTotal: s.attendanceTotal,
                        })),
                    });
                }
                updatedCount++;
            } catch (err) {
                errors.push(`USN ${entry.usn}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `Attendance updated for ${updatedCount} student(s).`,
            count: updatedCount,
            errors,
        }, { status: 200 });

    } catch (error) {
        console.error('Upload Attendance Error:', error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}

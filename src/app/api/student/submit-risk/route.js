// src/app/api/student/submit-risk/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RiskProfile from '@/models/RiskProfile';
import AcademicRecord from '@/models/AcademicRecord';
import User from '@/models/User';
import mongoose from 'mongoose';

// ── Scoring constants ─────────────────────────────────────────────────────────
// Questionnaire: 10 questions × options 0-4 (A-E) = raw max 40
// We scale to 0-50 so the grand total max is exactly 100.
const Q_RAW_MAX = 40;   // sum of 10 answers each 0-4
const Q_SCALED_MAX = 50;

// ── Scoring helpers ───────────────────────────────────────────────────────────

/**
 * Scale questionnaire raw (0-40) → 0-50
 */
function scaleQScore(raw) {
    return Math.round(Math.min(Q_SCALED_MAX, (raw / Q_RAW_MAX) * Q_SCALED_MAX));
}

/**
 * Academic marks penalty – non-linear so mediocre marks (40-74%) still add risk
 *   pct = 0   → 25 (max risk)
 *   pct = 40  → 19  (failing threshold)
 *   pct = 75  → 8   (average pass)
 *   pct = 100 → 0   (full marks)
 */
function academicPenalty(avgPct) {
    if (avgPct == null) return 0;  // no data = benefit of doubt
    // Invert: higher marks = lower penalty
    // Use a slightly steeper curve below 50%
    const clamped = Math.max(0, Math.min(100, avgPct));
    if (clamped >= 75) return Math.round((1 - clamped / 100) * 10);   // 0-10 range for 75-100%
    return Math.round(10 + ((75 - clamped) / 75) * 15);               // 10-25 range for 0-75%
}

/**
 * Attendance penalty – mirror of marks
 *   pct = 0   → 25 (max risk)
 *   pct = 75  → 6  (minimum acceptable)
 *   pct = 100 → 0
 */
function attendancePenalty(avgPct) {
    if (avgPct == null) return 0;
    const clamped = Math.max(0, Math.min(100, avgPct));
    if (clamped >= 75) return Math.round((1 - clamped / 100) * 10);
    return Math.round(10 + ((75 - clamped) / 75) * 15);
}

function calcRiskLevel(score, crisisFlag) {
    if (crisisFlag)   return 'Crisis';
    if (score <= 25)  return 'Low';       // clean bill of health
    if (score <= 55)  return 'Moderate';  // some concerns
    if (score <= 75)  return 'High';      // significant risk
    return 'Crisis';                       // extreme score without explicit crisis flag
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req) {
    await dbConnect();

    try {
        const { studentId, answers } = await req.json();
        // answers: [{ questionId: 1, score: 0-5 }, ...]

        if (!studentId || !answers?.length) {
            return NextResponse.json({ message: 'Missing studentId or answers.' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return NextResponse.json({ message: 'Invalid student ID.' }, { status: 400 });
        }

        const student = await User.findById(studentId).lean();
        if (!student) return NextResponse.json({ message: 'Student not found.' }, { status: 404 });

        // 1. Questionnaire score (scaled 0–50)
        const crisisAnswer = answers.find(a => a.questionId === 10);
        const crisisFlag = crisisAnswer ? crisisAnswer.score >= 3 : false;

        const rawQScore = answers.reduce((sum, a) => sum + Math.min(4, Math.max(0, a.score || 0)), 0);
        const questionnaireScore = scaleQScore(rawQScore);  // 0-50

        // 2. Academic penalty (0–25) — from latest academic records
        const acadRecords = await AcademicRecord.find({
            studentId: new mongoose.Types.ObjectId(studentId)
        }).lean();

        let allMarksPcts = [], allAttPcts = [];
        for (const rec of acadRecords) {
            for (const sub of rec.subjects) {
                if (sub.marksObtained != null && sub.maxMarks)
                    allMarksPcts.push((sub.marksObtained / sub.maxMarks) * 100);
                if (sub.attendancePresent != null && sub.attendanceTotal)
                    allAttPcts.push((sub.attendancePresent / sub.attendanceTotal) * 100);
            }
        }

        const avgMarks = allMarksPcts.length
            ? allMarksPcts.reduce((a, b) => a + b, 0) / allMarksPcts.length
            : null;
        const avgAtt = allAttPcts.length
            ? allAttPcts.reduce((a, b) => a + b, 0) / allAttPcts.length
            : null;

        const academicScore   = academicPenalty(avgMarks);
        const attendanceScore  = attendancePenalty(avgAtt);

        const rawTotal = questionnaireScore + academicScore + attendanceScore;

        // Crisis override: score must land in Crisis band (76+)
        const totalRiskScore = Math.min(100,
            crisisFlag ? Math.max(76, rawTotal) : rawTotal
        );

        const riskLevel = calcRiskLevel(totalRiskScore, crisisFlag);

        // 3. Upsert risk profile
        const profile = await RiskProfile.findOneAndUpdate(
            { studentId: new mongoose.Types.ObjectId(studentId) },
            {
                studentId: new mongoose.Types.ObjectId(studentId),
                instituteId: student.instituteId,
                questionnaireAnswers: answers,
                questionnaireScore,
                academicScore,
                attendanceScore,
                totalRiskScore,
                riskLevel,
                crisisFlag,
                completedAt: new Date(),
                lastRecalculated: new Date(),
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ profile }, { status: 200 });

    } catch (error) {
        console.error('Submit Risk Error:', error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}

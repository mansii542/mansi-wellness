// src/app/api/institute/risk-analytics/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RiskProfile from '@/models/RiskProfile';
import User from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get('instituteId');

        if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId)) {
            return NextResponse.json({ message: 'Invalid institute ID.' }, { status: 400 });
        }
        const instObj = new mongoose.Types.ObjectId(instituteId);

        // Aggregate risk profiles for this institute
        const byLevel = await RiskProfile.aggregate([
            { $match: { instituteId: instObj } },
            { $group: {
                _id: '$riskLevel',
                count: { $sum: 1 },
                avgScore: { $avg: '$totalRiskScore' }
            }},
        ]);

        // Score distribution bucketed into ranges 0-20, 21-40, 41-60, 61-80, 81-100
        const distribution = await RiskProfile.aggregate([
            { $match: { instituteId: instObj } },
            { $bucket: {
                groupBy: '$totalRiskScore',
                boundaries: [0, 21, 41, 61, 81, 101],
                default: 'Other',
                output: { count: { $sum: 1 } }
            }}
        ]);

        // Crisis count
        const crisisCount = await RiskProfile.countDocuments({ instituteId: instObj, crisisFlag: true });
        const totalStudents = await User.countDocuments({ instituteId: instObj, role: 'student' });
        const assessedCount = await RiskProfile.countDocuments({ instituteId: instObj });

        // Top 10 highest risk students
        const topRisk = await RiskProfile.find({ instituteId: instObj })
            .sort({ totalRiskScore: -1 })
            .limit(10)
            .populate('studentId', 'name usn')
            .lean();

        return NextResponse.json({
            byLevel,
            distribution: distribution.map(d => ({
                range: d._id === 'Other' ? '81-100' :
                    d._id === 0 ? '0-20' :
                    d._id === 21 ? '21-40' :
                    d._id === 41 ? '41-60' :
                    d._id === 61 ? '61-80' : '81-100',
                count: d.count
            })),
            crisisCount,
            totalStudents,
            assessedCount,
            topRisk,
        }, { status: 200 });

    } catch (error) {
        console.error('Risk Analytics Error:', error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}

// src/app/api/institute/counselors/route.js - COMPLETE CODE (Final Fix for Visibility)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User'; 
import mongoose from 'mongoose'; // CRITICAL: Ensure Mongoose is imported

/**
 * @method GET
 * @description Retrieves a list of all active Psychologists (Counselors).
 */
export async function GET(req) {
    await dbConnect();
    
    try {
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get('instituteId');

        if (!instituteId) {
            return NextResponse.json({ message: 'Institute ID is required.' }, { status: 400 });
        }
        
        // CRITICAL FIX: Ensure instituteId is treated as a valid ObjectId for the query
        const instituteObjectId = new mongoose.Types.ObjectId(instituteId);

        const counselors = await User.find({
            instituteId: instituteObjectId,
            role: 'psychologist',
        })
        .select('name _id') 
        .lean(); 

        const formattedCounselors = counselors.map(c => ({
            id: c._id.toString(),
            name: c.name,
        }));

        return NextResponse.json({ counselors: formattedCounselors }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch counselors:', error);
        if (error.name === 'BSONTypeError') {
            return NextResponse.json({ message: 'Invalid Institute ID format for query.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal server error fetching counselor list.' }, { status: 500 });
    }
}
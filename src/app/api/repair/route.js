import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    
    try {
        // Find your counselor (Anurag) and hard-reset the password
        // You can change 'Anurag@13' to whatever you want
        const result = await User.updateMany(
            { role: { $in: ['psychologist', 'teacher'] } },
            { $set: { password: 'Anurag@13' } }
        );

        return NextResponse.json({ 
            message: 'Database Repaired', 
            updatedCount: result.modifiedCount 
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
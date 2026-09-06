import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// Force dynamic (No caching)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    await dbConnect();
    try {
        console.log("--- FETCHING INSTITUTES ---");

        // 1. Search for users with role 'admin' OR 'institute'
        const institutes = await User.find({ 
            role: { $in: ['admin', 'institute'] } 
        })
        .select('name _id role')
        .sort({ name: 1 })
        .lean();

        console.log(`Found ${institutes.length} institutes.`);
        
        // If empty, let's debug by counting ALL users
        if (institutes.length === 0) {
            const totalUsers = await User.countDocuments({});
            console.log(`DEBUG: Total users in DB: ${totalUsers}`);
            if (totalUsers > 0) {
                const sample = await User.findOne({});
                console.log("Sample User Role:", sample?.role);
            }
        }

        return NextResponse.json({ institutes }, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error("Institute Fetch Error:", error);
        return NextResponse.json({ message: 'Error fetching institutes' }, { status: 500 });
    }
}
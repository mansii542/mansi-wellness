import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Only run index repair once per server process
let indexesRepaired = false;

async function repairUserIndexesIfNeeded() {
    if (indexesRepaired) return;
    try {
        await User.collection.dropIndex('email_1').catch(() => {});
        await User.collection.dropIndex('usn_1').catch(() => {});
        await User.collection.dropIndex('loginId_1').catch(() => {});
        await User.syncIndexes();
        indexesRepaired = true;
    } catch {
        // If repair fails, we still fall back to the original duplicate error
    }
}

export async function POST(req) {
    await dbConnect();
    
    try {
        const body = await req.json();
        const { instituteId, role, entries } = body; // entries is array of {name, usn/password}

        if (!instituteId || !role || !entries || !entries.length) {
            return NextResponse.json({ message: 'No data provided.' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(instituteId)) {
            return NextResponse.json({ message: 'Invalid instituteId.' }, { status: 400 });
        }

        const instituteObjectId = new mongoose.Types.ObjectId(instituteId);

        let createdCount = 0;
        const errors = [];

        const generateUniqueLoginId = async (prefix) => {
            for (let i = 0; i < 8; i++) { // try a few times to avoid collisions
                const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-Digit ID
                const candidate = `${prefix}-${randomNum}`;
                const exists = await User.exists({ loginId: candidate });
                if (!exists) return candidate;
            }
            return null;
        };

        for (const entry of entries) {
            const newUser = {
                name: entry.name,
                role: role,
                instituteId: instituteObjectId,
                status: 'active'
            };

            // --- STAFF LOGIC ---
            if (role === 'teacher' || role === 'psychologist') {
                const prefix = role === 'teacher' ? 'TCHR' : 'PSYCH';
                const uniqueLoginId = await generateUniqueLoginId(prefix);
                if (!uniqueLoginId) {
                    errors.push(`${entry.name}: Could not generate unique Login ID. Try again.`);
                    continue;
                }
                newUser.loginId = uniqueLoginId; 
                
                if (!entry.password) {
                    errors.push(`${entry.name}: Password required.`);
                    continue;
                }
                newUser.password = await bcrypt.hash(entry.password, 10);
            }

            // --- STUDENT LOGIC ---
            if (role === 'student') {
                if (!entry.usn) {
                    errors.push(`${entry.name}: Missing USN.`);
                    continue;
                }
                newUser.usn = entry.usn.toUpperCase().trim();
            }

            try {
                // Ensure email is UNDEFINED so Mongo ignores it
                delete newUser.email; 
                
                await User.create(newUser);
                createdCount++;
            } catch (err) {
                if (err.code === 11000) {
                    const field = Object.keys(err.keyPattern || {})[0];

                    if (field === 'email') {
                        // Legacy bad email index – attempt automatic repair once, then retry this insert
                        await repairUserIndexesIfNeeded();
                        try {
                            await User.create(newUser);
                            createdCount++;
                            continue;
                        } catch {
                            errors.push(`${entry.name}: Email index issue persists. Please try again.`);
                        }
                    } else {
                        errors.push(`${entry.name}: ${field ? field.toUpperCase() : 'FIELD'} already exists.`);
                    }
                } else {
                    errors.push(`${entry.name}: Failed.`);
                }
            }
        }

        // Always return 200 so the dashboard UX isn't blocked by partly valid data.
        // The client can inspect `count` and `details` to show per-row issues.
        return NextResponse.json({ 
            message: createdCount > 0 
                ? `Success: ${createdCount} user(s) added${errors.length ? ' with some issues' : ''}.` 
                : (errors[0] || 'No users added. Check input.'),
            count: createdCount, 
            errors: errors,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
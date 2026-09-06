import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function DELETE(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

    try {
        await User.findByIdAndDelete(id);
        await User.deleteMany({ instituteId: id });
        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
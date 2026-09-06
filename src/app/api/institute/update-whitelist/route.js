import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { students, instituteId } = await req.json();

    if (!students || !instituteId) {
      return NextResponse.json({ message: "Missing student data or institute ID." }, { status: 400 });
    }

    await connectDB();

    // 1. Fetch the existing institute document
    const institute = await User.findById(instituteId);
    if (!institute) {
      return NextResponse.json({ message: "Institute not found." }, { status: 404 });
    }

    const currentWhitelist = institute.studentWhitelist || [];
    const newStudents = [];
    let updatedCount = 0;
    let errorCount = 0;

    // 2. Filter out duplicates based on USN
    const existingUsns = new Set(currentWhitelist.map(s => s.usn));

    for (const student of students) {
      if (student.usn && !existingUsns.has(student.usn)) {
        newStudents.push(student);
        existingUsns.add(student.usn);
        updatedCount++;
      } else {
        errorCount++;
      }
    }

    // 3. Combine current list with new, unique students
    const finalWhitelist = [...currentWhitelist, ...newStudents];

    // 4. Update the document in the database
    const updatedInstitute = await User.findByIdAndUpdate(
      instituteId,
      { studentWhitelist: finalWhitelist },
      { new: true, runValidators: true }
    ).select("studentWhitelist");

    return NextResponse.json({
      message: "Whitelist updated.",
      updatedCount,
      errorCount,
      updatedWhitelist: updatedInstitute.studentWhitelist
    }, { status: 200 });

  } catch (error) {
    console.error("WHITELIST UPDATE ERROR:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
// src/models/AcademicRecord.js
import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    marksObtained: { type: Number, default: null },
    maxMarks: { type: Number, default: 100 },
    attendancePresent: { type: Number, default: null },
    attendanceTotal: { type: Number, default: null },
}, { _id: false });

const AcademicRecordSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    academicYear: { type: String, default: '2024-25', trim: true },
    subjects: [SubjectSchema],
}, {
    timestamps: true
});

// Unique constraint: one record per student per semester per year
AcademicRecordSchema.index({ studentId: 1, semester: 1, academicYear: 1 }, { unique: true });

export default mongoose.models.AcademicRecord || mongoose.model('AcademicRecord', AcademicRecordSchema);

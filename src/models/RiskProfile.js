// src/models/RiskProfile.js
import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
    questionId: { type: Number, required: true },
    score: { type: Number, required: true, min: 0, max: 5 },
}, { _id: false });

const RiskProfileSchema = new mongoose.Schema({
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    instituteId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    questionnaireAnswers: [AnswerSchema],
    questionnaireScore:   { type: Number, default: 0 },  // 0–50
    academicScore:        { type: Number, default: 0 },  // 0–25
    attendanceScore:      { type: Number, default: 0 },  // 0–25
    totalRiskScore:       { type: Number, default: 0 },  // 0–100

    riskLevel:  { type: String, enum: ['Low', 'Moderate', 'High', 'Crisis'], default: 'Low' },
    crisisFlag: { type: Boolean, default: false },

    completedAt:       { type: Date, default: Date.now },
    lastRecalculated:  { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.RiskProfile || mongoose.model('RiskProfile', RiskProfileSchema);

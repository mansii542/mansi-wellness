import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    // FIX: Changed to String to accept USNs (e.g., "1BM23CS001") and Staff IDs
    starterId: { type: String, required: true }, 
    counselorId: { type: String, required: true },

    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    isAnonymous: { type: Boolean, default: true },

    // Clinical Tools (Grading & Tags)
    severity: { 
        type: String, 
        enum: ['Green', 'Yellow', 'Red', 'Pending'], 
        default: 'Pending' 
    },
    problemType: { type: String, default: 'Unspecified' },
    isReported: { type: Boolean, default: false },

    // Timestamps
    startedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// 7-Day Auto-Delete Index
// Note: This ensures chats are deleted 7 days after the last message
// If this index already exists with different options, you might need to drop the collection in MongoDB Compass.
SessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
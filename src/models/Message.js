import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    // Link to the Session (This remains an ObjectId because the Session itself has a DB ID)
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    
    // FIX: Changed to String to accept USNs or Staff IDs
    senderId: { type: String, required: true }, 
    
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
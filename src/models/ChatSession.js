// src/models/ChatSession.js - COMPLETE CODE (Final Tagging Update)
import mongoose from "mongoose";

// Define possible issue tags for wellness analysis
const ISSUE_TAGS = [
    'Academic Stress', 'Exam Anxiety', 'Career Confusion', 
    'Family Conflict', 'Relationship Issues', 'Peer Pressure',
    'Low Self-Esteem', 'Sleep Problems', 'Grief/Loss',
    'Depression', 'Anxiety Disorder', 'Substance Abuse', 
    'Adjustment Issues', 'Financial Stress', 'Isolation/Loneliness',
    'Bullying/Harassment', 'Time Management', 'Other Mental Health',
    'Physical Health Concern', 'General Wellness Check'
];


const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  priority: { 
    type: String, 
    enum: ['Normal', 'Critical', 'Emergency'], 
    default: 'Normal' 
  },
  reported: { type: Boolean, default: false }, 
}, { _id: false });

const ChatSessionSchema = new mongoose.Schema(
  {
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    psychologistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [MessageSchema],
    
    // NEW: Counselor assigned tags
    issueTags: [{
        type: String,
        enum: ISSUE_TAGS
    }],
    
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
    },

    // --- Ephemeral Data Logic: TTL Index for 7-day deletion ---
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: '7d' 
    },
  },
  { timestamps: true }
);

const ChatSession = mongoose.models.ChatSession || mongoose.model("ChatSession", ChatSessionSchema);
export default ChatSession;
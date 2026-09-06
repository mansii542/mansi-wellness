import mongoose from 'mongoose';

// FORCE REFRESH: Deletes the old model so these new rules take effect immediately.
if (mongoose.models && mongoose.models.User) {
    delete mongoose.models.User;
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },

    // --- THE FIX ---
    // unique: false -> Allows duplicates (including multiple empty fields)
    // required: false -> You never have to provide it
    email: { 
        type: String, 
        required: false,
        unique: false, // <--- CRITICAL: No longer unique
        trim: true,
        lowercase: true
    },

    // Staff Login ID (Teachers/Psychologists)
    loginId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },

    // Student USN
    usn: { 
        type: String, 
        unique: true, 
        sparse: true 
    },

    password: { type: String, select: false },
    
    role: { 
        type: String, 
        enum: ['institute', 'student', 'teacher', 'psychologist'], 
        required: true 
    },

    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
export default User;
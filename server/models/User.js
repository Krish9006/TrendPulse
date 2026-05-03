const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        unique: true,
        sparse: true // Only for users created via Clerk
    },
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);

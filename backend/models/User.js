import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // Allows multiple null/undefined values while maintaining uniqueness for non-null values
        trim: true
    },
    workingDomain: {
        type: String,
        trim: true
    },
    organization: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    lastResults: [
        {
            name: { type: String, required: true },
            institution: { type: String, required: true },
            date: { type: Date, default: Date.now },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    otp: {
        code: String,
        expiresAt: Date,
        sentTo: [String] 
    },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;
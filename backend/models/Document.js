import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  documentName: {
    type: String,
    required: true,
    trim: true,
  },
  documentType: {
    type: String,
    enum: ['passport', 'aadhar', 'driving_license', 'certificate', 'degree', 'other'],
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  // Verification Results
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'fake', 'under_review'],
    default: 'pending',
  },
  verificationResult: {
    isFake: {
      type: Boolean,
      default: null,
    },
    confidence: {
      type: Number, // 0-100 confidence score
      default: 0,
    },
    details: {
      type: String, // Detailed findings
    },
  },
  adminReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: Date,
    adminNotes: String,
    finalVerdict: {
      type: String,
      enum: ['approved', 'rejected', 'needs_more_info'],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

export default Document;

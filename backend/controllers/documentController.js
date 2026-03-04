import Document from "../models/Document.js";
import User from "../models/User.js";

// Upload document for verification
export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentName, documentType } = req.body;

    if (!documentName || !documentType) {
      return res.status(400).json({
        success: false,
        message: "Document name and type are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Check if user is approved
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: "Only approved users can upload documents"
      });
    }

    // Create document record
    const newDocument = new Document({
      userId,
      documentName,
      documentType,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      verificationStatus: 'pending'
    });

    const savedDocument = await newDocument.save();

    res.json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: savedDocument._id,
        documentName: savedDocument.documentName,
        documentType: savedDocument.documentType,
        uploadDate: savedDocument.uploadDate,
        verificationStatus: savedDocument.verificationStatus
      }
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's documents
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await Document.find({ userId })
      .select('-filePath')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all documents for admin review
export const getAllDocumentsForAdmin = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('userId', 'firstname lastname email organization')
      .select('-filePath')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get documents for specific user (admin view)
export const getUserDocumentsForAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const documents = await Document.find({ userId })
      .populate('userId', 'firstname lastname email organization')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update document verification result (from ML/OCR API)
export const updateDocumentVerification = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { isFake, confidence, details, verificationStatus } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required"
      });
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        verificationStatus: verificationStatus || 'verified',
        'verificationResult.isFake': isFake,
        'verificationResult.confidence': confidence || 0,
        'verificationResult.details': details,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    res.json({
      success: true,
      message: "Document verification updated",
      document
    });
  } catch (error) {
    console.error("Error updating document verification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin review document
export const reviewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { finalVerdict, adminNotes } = req.body;

    if (!documentId || !finalVerdict) {
      return res.status(400).json({
        success: false,
        message: "Document ID and verdict are required"
      });
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        'adminReview.finalVerdict': finalVerdict,
        'adminReview.adminNotes': adminNotes,
        'adminReview.reviewedAt': Date.now(),
        verificationStatus: finalVerdict === 'approved' ? 'verified' : 'rejected'
      },
      { new: true }
    ).populate('userId', 'firstname lastname email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    res.json({
      success: true,
      message: "Document reviewed successfully",
      document
    });
  } catch (error) {
    console.error("Error reviewing document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    // Check if user owns the document
    if (document.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own documents"
      });
    }

    await Document.findByIdAndDelete(documentId);

    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

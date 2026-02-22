import axios from "axios";
import FormData from "form-data";
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

// Proxy to external forge-detection API to avoid browser CORS issues
export const proxyForgeDetection = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Allow runtime override and local fallbacks; default to local ML /extract endpoint
  const forgeApiUrl = process.env.FORGE_API_URL || "http://localhost:8000/extract";
  const targetUrls = [forgeApiUrl];
  // If someone pointed to /predict, also try /extract as a fallback
  if (!forgeApiUrl.endsWith("/extract")) {
    const alt = forgeApiUrl.replace(/\/predict\/?$/, "/extract");
    if (!targetUrls.includes(alt)) targetUrls.push(alt);
  }
  const mockEnabled = process.env.FORGE_API_MOCK === "true";
  const fallbackOnError = process.env.FORGE_API_FALLBACK === "mock";

  // Optional mock path to keep UI working when upstream is down
  if (mockEnabled) {
    return res.json({
      success: true,
      detections: [
        { bbox: [50, 50, 200, 120], class_name: "true", confidence: 0.92 },
        { bbox: [260, 180, 420, 240], class_name: "fake", confidence: 0.71 },
      ],
      note: "Mocked forge-detection response (FORGE_API_MOCK=true)",
    });
  }

  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    // Also send as "image" in case upstream expects that field name
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    let response;
    let lastError;
    for (const url of targetUrls) {
      try {
        response = await axios.post(
          url,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Accept: "application/json",
            },
            maxBodyLength: Infinity,
            maxRedirects: 0,
            timeout: 20000,
          }
        );
        break; // success
      } catch (err) {
        lastError = err;
        // Only continue loop on 404 to try fallback; otherwise rethrow
        const status = err?.response?.status;
        if (status !== 404) {
          throw err;
        }
      }
    }

    if (!response) {
      // If all attempts failed, throw last error to outer catch
      throw lastError || new Error("Forge detection request failed");
    }

    const payload = response.data;

    // Normalize response to frontend shape: { detections: [...] }
    let normalized = payload;
    if (!payload?.detections) {
      const docType = payload?.document_type || payload?.documentType || "unknown";
      const status = payload?.final_status || payload?.finalStatus || "EXTRACTED";

      // Mark the document area as a "fake" detection if it's suspicious
      // so the Verify.jsx frontend draws a red alert bounding box correctly.
      const isFake = /SUSPICIOUS|FAKE|INVALID/i.test(status);
      normalized = {
        detections: [
          {
            bbox: [40, 60, 320, 180], // default mockup bounding box
            class_name: isFake ? "fake" : "true",
            confidence: isFake ? (payload?.tampering_score || 0.8) : 0.9,
            document_type: docType,
            raw: payload,
          },
        ],
        source: "forge-proxy-normalized",
        raw: payload,
      };
    }

    res.status(response.status).json(normalized);
  } catch (error) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: error.message || "Detection failed" };
    console.error("Forge detection proxy error:", {
      status,
      data,
      message: error.message,
    });

    // Optional automatic mock fallback when upstream is down
    if (fallbackOnError || status === 503) {
      return res.json({
        success: true,
        detections: [
          { bbox: [40, 60, 320, 180], class_name: "true", confidence: 0.94, document_type: "marksheet" },
        ],
        summary: {
          totalDetections: 1,
          fakeDetections: 0,
          trueDetections: 1,
        },
        note: "Mocked response because forge detection service is unavailable",
      });
    }

    // In development, surface upstream error to help debugging 401s/403s
    const isDev = process.env.NODE_ENV !== "production";
    const clientDetails = isDev ? data : undefined;

    res
      .status(status)
      .json({ success: false, message: "Verification service unavailable", details: clientDetails });
  }
};

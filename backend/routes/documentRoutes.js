import express from "express";
import { userAuth } from "../middlewares/Auth.js";
import { adminAuth } from "../middlewares/AdminAuth.js";
import multer from "multer";
import {
  uploadDocument,
  getUserDocuments,
  getAllDocumentsForAdmin,
  getUserDocumentsForAdmin,
  updateDocumentVerification,
  reviewDocument,
  deleteDocument,
  proxyForgeDetection,
} from "../controllers/documentController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// User routes - upload and view their documents
router.post("/upload", userAuth, uploadDocument);
router.get("/my-documents", userAuth, getUserDocuments);
router.delete("/:documentId", userAuth, deleteDocument);

// Admin routes - view all documents
router.get("/admin/all-documents", adminAuth, getAllDocumentsForAdmin);
router.get("/admin/user/:userId", adminAuth, getUserDocumentsForAdmin);
router.patch("/admin/verify/:documentId", adminAuth, updateDocumentVerification);
router.patch("/admin/review/:documentId", adminAuth, reviewDocument);

// Proxy forge detection (avoids CORS from frontend direct calls)
// Public proxy to avoid CORS blocking the front-end demo; add auth later if needed
router.post("/proxy/forge-detect", upload.single("file"), proxyForgeDetection);

export default router;

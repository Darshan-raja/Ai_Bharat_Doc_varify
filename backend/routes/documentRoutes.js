import express from "express";
import { userAuth } from "../middlewares/Auth.js";
import { adminAuth } from "../middlewares/AdminAuth.js";
import {
  uploadDocument,
  getUserDocuments,
  getAllDocumentsForAdmin,
  getUserDocumentsForAdmin,
  updateDocumentVerification,
  reviewDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// User routes - upload and view their documents
router.post("/upload", userAuth, uploadDocument);
router.get("/my-documents", userAuth, getUserDocuments);
router.delete("/:documentId", userAuth, deleteDocument);

// Admin routes - view all documents
router.get("/admin/all-documents", adminAuth, getAllDocumentsForAdmin);
router.get("/admin/user/:userId", adminAuth, getUserDocumentsForAdmin);
router.patch("/admin/verify/:documentId", adminAuth, updateDocumentVerification);
router.patch("/admin/review/:documentId", adminAuth, reviewDocument);

export default router;

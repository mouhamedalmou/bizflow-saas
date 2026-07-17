import { Router } from "express";
import { uploadImage } from "../controllers/uploadController";
import { adminOnly, protect } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";
const router = Router(); router.post("/image", protect, adminOnly, upload.single("image"), uploadImage); export default router;

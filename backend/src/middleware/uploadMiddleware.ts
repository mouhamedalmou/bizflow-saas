import multer from "multer";
import ApiError from "../utils/apiError";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export default multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, callback) => { if (!allowedMimeTypes.has(file.mimetype)) return callback(new ApiError(415, "Only JPEG, PNG, WebP and AVIF images are allowed")); callback(null, true); } });

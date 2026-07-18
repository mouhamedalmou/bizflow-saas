import path from "node:path";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, "No image uploaded");

  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) throw new ApiError(500, "AWS S3 is not configured");

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const s3 = new S3Client({
    region,
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });
  const extension = path.extname(req.file.originalname).toLowerCase();
  const key = `products/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(key)}`;
  res.status(201).json({ success: true, message: "Image uploaded successfully", imageUrl });
});

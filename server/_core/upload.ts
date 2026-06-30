import type { Express } from "express";
import { Request, Response } from "express";
import * as db from "../db";
import { sdk } from "./sdk";
import { storagePut } from "../storage";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only allow .zip files
    if (path.extname(file.originalname).toLowerCase() === ".zip") {
      cb(null, true);
    } else {
      cb(new Error("Only .ZIP files are allowed"));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});

/**
 * Calculate the price based on file size
 * R$ 1.00 per MB for files >= 1MB
 * R$ 3.50 fixed for files < 1MB
 */
function calculatePrice(fileSizeInBytes: number): number {
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  
  if (fileSizeInMB >= 1) {
    return Math.ceil(fileSizeInMB) * 1.0;
  } else {
    return 3.5;
  }
}

export function registerUploadRoutes(app: Express) {
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      // Authenticate the user from session cookie or Authorization header
      let user: Awaited<ReturnType<typeof sdk.authenticateRequest>> | null = null;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Check if file was uploaded
      const file = req.file as Express.Multer.File | undefined;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Validate file size
      const fileSizeInBytes = file.size;
      if (fileSizeInBytes === 0) {
        res.status(400).json({ error: "File is empty" });
        return;
      }

      // Calculate price
      const amount = calculatePrice(fileSizeInBytes);

      // Upload file to S3 storage
      let filePath: string;
      try {
        const storageKey = `uploads/${user.id}/${Date.now()}-${file.originalname}`;
        const storageResult = await storagePut(storageKey, file.buffer, "application/zip");
        filePath = storageResult.key;
      } catch (storageError) {
        console.error("[Upload] Storage error:", storageError);
        // Fallback to a local path if storage is not configured
        filePath = `uploads/${user.id}/${Date.now()}-${file.originalname}`;
      }

      // Create ticket in database
      const result = await db.createTicket({
        userId: user.id,
        fileName: file.originalname,
        fileSize: fileSizeInBytes,
        filePath,
        status: "pending",
        amount: amount.toString(),
        paymentStatus: "pending",
      } as any);

      if (!result) {
        res.status(500).json({ error: "Failed to create ticket" });
        return;
      }

      res.json({
        success: true,
        ticketId: (result as any).insertId || 1,
        amount,
        fileName: file.originalname,
        fileSize: fileSizeInBytes,
      });
    } catch (error) {
      console.error("[Upload] Error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
}

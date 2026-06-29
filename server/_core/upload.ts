import type { Express } from "express";
import { Request, Response } from "express";
import * as db from "../db";
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
      // Check if user is authenticated (from session)
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Check if file was uploaded
      const file = req.file as any;
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

      // TODO: Upload file to S3 and get the path
      // For now, we'll use a placeholder S3 path
      const filePath = `uploads/temp/${Date.now()}-${file.originalname}`;

      // Create ticket in database
      const result = await db.createTicket({
        userId: 1, // TODO: Get from authenticated user
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

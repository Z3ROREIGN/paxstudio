import type { Express, Request, Response } from "express";
import * as db from "../db";
import { handlePaymentWebhook } from "../mistickpay";

export function registerWebhookRoutes(app: Express) {
  /**
   * MisticPay Payment Webhook
   * Called when a payment is completed, failed, or cancelled
   */
  app.post("/api/webhooks/mistickpay", async (req: Request, res: Response) => {
    try {
      const signature = req.headers["x-mistickpay-signature"] as string;
      const payload = req.body;

      // Verify and handle webhook
      const isValid = await handlePaymentWebhook(payload, signature);

      if (!isValid) {
        res.status(400).json({ error: "Invalid webhook" });
        return;
      }

      // Update ticket payment status
      if (payload.status === "completed" && payload.metadata?.ticketId) {
        const ticketId = payload.metadata.ticketId;
        // TODO: Update ticket payment status to "completed" in database
        console.log(`[Webhook] Payment confirmed for ticket ${ticketId}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  /**
   * Health check endpoint for webhooks
   */
  app.get("/api/webhooks/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}

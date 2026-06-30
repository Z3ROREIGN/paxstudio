/**
 * MisticPay Integration Module
 *
 * This module handles payment processing through MisticPay API.
 *
 * Required environment variables:
 * - MISTICKPAY_API_KEY: Your MisticPay API key
 * - MISTICKPAY_WEBHOOK_SECRET: Webhook secret for payment confirmations
 * - MISTICKPAY_MERCHANT_ID: Your merchant ID (optional)
 */

import axios from "axios";
import crypto from "crypto";

const MISTICKPAY_API_BASE = "https://api.mistickpay.com/v1";
const API_KEY = process.env.MISTICKPAY_API_KEY || "";
const WEBHOOK_SECRET = process.env.MISTICKPAY_WEBHOOK_SECRET || "";

const IS_TEST_MODE = !API_KEY || API_KEY === "test_key";

interface PaymentRequest {
  ticketId: number;
  amount: number;
  clientEmail: string;
  clientName: string;
  description: string;
}

interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  status: "pending" | "completed" | "failed";
}

/**
 * Create a payment request with MisticPay.
 * Falls back to a mock response when MISTICKPAY_API_KEY is not configured.
 */
export async function createPayment(req: PaymentRequest): Promise<PaymentResponse> {
  if (IS_TEST_MODE) {
    const mockPaymentId = `pay_${Date.now()}`;
    console.log("[MisticPay] Test mode — creating mock payment:", {
      ticketId: req.ticketId,
      amount: req.amount,
      email: req.clientEmail,
    });
    return {
      paymentId: mockPaymentId,
      paymentUrl: "", // Empty URL triggers in-app confirmation flow
      status: "pending",
    };
  }

  try {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const response = await axios.post(
      `${MISTICKPAY_API_BASE}/payments`,
      {
        amount: Math.round(req.amount * 100), // Convert to cents
        currency: "BRL",
        customer: {
          email: req.clientEmail,
          name: req.clientName,
        },
        description: req.description,
        metadata: {
          ticketId: String(req.ticketId),
        },
        return_url: `${appUrl}/payment/success`,
        webhook_url: `${appUrl}/api/webhooks/mistickpay`,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      paymentId: response.data.id,
      paymentUrl: response.data.checkout_url,
      status: response.data.status,
    };
  } catch (error) {
    console.error("[MisticPay] Error creating payment:", error);
    throw new Error("Failed to create payment");
  }
}

/**
 * Verify a payment status with MisticPay.
 */
export async function verifyPayment(paymentId: string): Promise<boolean> {
  if (IS_TEST_MODE) {
    console.log("[MisticPay] Test mode — assuming payment verified:", paymentId);
    return true;
  }

  try {
    const response = await axios.get(`${MISTICKPAY_API_BASE}/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return response.data.status === "completed";
  } catch (error) {
    console.error("[MisticPay] Error verifying payment:", error);
    return false;
  }
}

/**
 * Handle webhook from MisticPay for payment confirmations.
 * Verifies the HMAC-SHA256 signature when MISTICKPAY_WEBHOOK_SECRET is set.
 */
export async function handlePaymentWebhook(payload: any, signature: string): Promise<boolean> {
  try {
    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest("hex");

      const providedSignature = signature?.startsWith("sha256=")
        ? signature.slice(7)
        : signature;

      if (!providedSignature || expectedSignature !== providedSignature) {
        console.warn("[MisticPay] Invalid webhook signature");
        return false;
      }
    }

    console.log("[MisticPay] Webhook received:", {
      status: payload.status,
      ticketId: payload.metadata?.ticketId,
    });

    return payload.status === "completed" || payload.status === "failed";
  } catch (error) {
    console.error("[MisticPay] Error handling webhook:", error);
    return false;
  }
}

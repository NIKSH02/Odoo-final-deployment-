import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  retryPayment,
  handleRazorpayWebhook,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requirePlayer } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create-order", protect, requirePlayer, createPaymentOrder);
router.post("/verify", protect, requirePlayer, verifyPayment);
router.post("/failure", protect, requirePlayer, handlePaymentFailure);
router.post("/retry", protect, requirePlayer, retryPayment);

// Webhook route (no authentication required)
router.post("/webhook", express.raw({ type: "application/json" }), handleRazorpayWebhook);

export default router;

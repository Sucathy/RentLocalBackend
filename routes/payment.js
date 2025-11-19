const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ 1. Create an order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    const options = {
      amount: amount * 100, // convert ₹ to paise
      currency,
      receipt: receipt || "PG-Order-" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    console.log("Order Created:", order);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// ✅ 2. Verify payment
router.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;

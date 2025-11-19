const express = require("express");
const router = express.Router();
const WishList = require("../models/WishList");
const verifyToken = require("../middleware/auth"); // JWT middleware

// ✅ Add to wishlist
router.post("/add", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT
    const { pgId } = req.body;

    if (!pgId) {
      return res.status(400).json({ success: false, message: "pgId is required" });
    }

    const exists = await WishList.findOne({ userId, pgId });
    if (exists) {
      return res.status(400).json({ success: false, message: "Already in wishlist" });
    }

    const newWish = new WishList({ userId, pgId });
    await newWish.save();

    // Populate PG details
    await newWish.populate("pgId");

    res.status(201).json({ success: true, wishlistItem: newWish });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Remove from wishlist
router.delete("/remove", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pgId } = req.body;

    if (!pgId) {
      return res.status(400).json({ success: false, message: "pgId is required" });
    }

    const removed = await WishList.findOneAndDelete({ userId, pgId });

    if (!removed) {
      return res.status(404).json({ success: false, message: "Wishlist item not found" });
    }

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove wishlist error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get all wishlist items for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await WishList.find({ userId }).populate("pgId");

    res.status(200).json({ success: true, wishlist });
  } catch (err) {
    console.error("Fetch wishlist error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

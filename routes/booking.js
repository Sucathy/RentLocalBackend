const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const PgDetail = require("../models/PgDetail");
const verifyToken = require("../middleware/auth");

// ------------------------------------------------------------
// GET /api/bookings/my  →  Fetch all bookings for logged-in user
// ------------------------------------------------------------
router.get("/my", verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId; // ✅ from decoded token

        // Find all bookings belonging to this user
        const bookings = await Booking.find({ userId })
            .populate("pgId", "name location price images") // ✅ join PG details
            .sort({ createdAt: -1 });

        if (!bookings.length) {
            return res.status(200).json({ message: "No bookings yet.", bookings: [] });
        }

        res.status(200).json({
            message: "Bookings fetched successfully ✅",
            bookings,
        });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ message: "Server error fetching bookings." });
    }
});

module.exports = router;

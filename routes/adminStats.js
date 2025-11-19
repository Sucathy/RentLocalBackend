
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Host = require("../models/Host");
const Pg = require("../models/PgDetail");
const Admin = require("../models/Admin");
// const Booking = require("../models/Booking");

// ✅ Admin JWT middleware
const verifyAdminToken = require("../middleware/authAdmin");

// GET /api/admin/stats
router.get("/stats", verifyAdminToken, async (req, res) => {
  try {
    // Check admin role
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Fetch counts
    const usersCount = await User.countDocuments();
    const hostsCount = await Host.countDocuments();
    const pgsCount = await Pg.countDocuments();
    const adminsCount = await Admin.countDocuments();
    // const bookingsCount = await Booking.countDocuments();

    res.status(200).json({
      success: true,
      users: usersCount,
      hosts: hostsCount,
      pgs: pgsCount,
      admins: adminsCount,
      // bookings: bookingsCount,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

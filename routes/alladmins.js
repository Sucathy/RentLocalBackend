const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const router = express.Router();

// Get all admins
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update admin
router.put("/:id", async (req, res) => {
  try {
    const { email, password, fullName } = req.body; // removed username
    const updateData = {};

    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete admin
router.delete("/:id", async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const hosts = await Host.countDocuments();
    const pgs = await PgDetails.countDocuments();
    const admins = await Admin.countDocuments();
    const bookings = await Booking.countDocuments();

    res.json({ users, hosts, pgs, admins, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

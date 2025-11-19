const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const verifyAdminToken = require("../middleware/authAdmin");
const router = express.Router();

const JWT_SECRET = process.env.JWT_ADMIN_SECRET;

// ------------------- ADMIN SIGNUP -------------------
router.post("/adminsignup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword, role: "admin" });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error("Admin signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------- ADMIN LOGIN -------------------
router.post("/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // ✅ Create JWT token
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: "2d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------- GET CURRENT ADMIN -------------------
router.get("/me", verifyAdminToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ admin });
  } catch (err) {
    console.error("Get admin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

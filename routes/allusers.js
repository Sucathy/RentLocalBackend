const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password. iuewuidew
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update 
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

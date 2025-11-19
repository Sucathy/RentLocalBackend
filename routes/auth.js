// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const Admin = require("../models/Admin");
// const authMiddleware = require("../middleware/auth");

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// const COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "strict",
//   maxAge: 24 * 60 * 60 * 1000, // 1 day
// };

// // === SIGNUP ===
// router.post("/signup", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     if (!username || !email || !password)
//       return res.status(400).json({ message: "All fields are required" });

//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ username, email, password: hashedPassword });
//     await newUser.save();

//     res.status(201).json({ message: "User created successfully" });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === LOGIN ===
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password required" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "2d" });

//     // ✅ Send HttpOnly cookie
//     res.cookie("token", token, COOKIE_OPTIONS).status(200).json({ message: "Login successful" });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === PROFILE ===
// router.get("/profile", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error("Profile fetch error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === UPDATE PROFILE ===
// router.put("/profile", authMiddleware, async (req, res) => {
//   const updates = (({ username, fullName, age, gender, phoneNumber, profileImage }) =>
//     ({ username, fullName, age, gender, phoneNumber, profileImage }))(req.body);

//   try {
//     const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select("-password");
//     res.json(updatedUser);
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ message: "Update failed", error: err.message });
//   }
// });

// // === LOGOUT ===
// router.post("/logout", (req, res) => {
//   res.clearCookie("token", COOKIE_OPTIONS);
//   res.json({ message: "Logged out successfully" });
// });


// // get all users
// // router.get("/allusers", async (req, res) => {
// //   try {
// //     const users = await User.find().select("-password"); // don't send passwords
// //     res.json(users);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // // ✅ Get all admins
// // router.post("/adminsignup", async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (!email || !password)
// //       return res.status(400).json({ message: "Email and password required" });

// //     const existingAdmin = await Admin.findOne({ email });
// //     if (existingAdmin)
// //       return res.status(400).json({ message: "Admin already exists" });

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const admin = new Admin({
// //       email,
// //       password: hashedPassword,
// //       role: "admin",
// //     });

// //     await admin.save();

// //     res.status(201).json({ message: "Admin created successfully" });
// //   } catch (err) {
// //     console.error("Admin signup error:", err);
// //     res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // });

// // // Admin login
// // router.post("/adminlogin", async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const admin = await Admin.findOne({ email });
// //     if (!admin)
// //       return res.status(400).json({ message: "Invalid email or password" });

// //     const isMatch = await bcrypt.compare(password, admin.password);
// //     if (!isMatch)
// //       return res.status(400).json({ message: "Invalid email or password" });

// //     const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
// //       expiresIn: "2d",
// //     });

// //     res.json({
// //       message: "Login successful",
// //       token,
// //       user: {
// //         id: admin._id,
// //         email: admin.email,
// //         role: admin.role,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Admin login error:", err);
// //     res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // });

// module.exports = router;



const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Admin = require("../models/Admin");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// --- In-memory OTP store (use Redis in production) ---
let otpStore = {};

// --- Mail Transport ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// === SEND OTP ===
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min validity

    await transporter.sendMail({
      from: `"LocalRent" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - LocalRent",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// === VERIFY OTP ===
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore[email];

  if (!stored) return res.status(400).json({ message: "OTP not sent" });
  if (Date.now() > stored.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }
  if (stored.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  otpStore[email].verified = true;
  res.json({ message: "OTP verified successfully" });
});

// === SIGNUP (with OTP check) ===
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // OTP must be verified
    if (!otpStore[email] || !otpStore[email].verified)
      return res.status(400).json({ message: "Please verify OTP before signup" });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    delete otpStore[email]; // cleanup

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === LOGIN ===
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "2d" });

    // Send HttpOnly cookie
    res.cookie("token", token, COOKIE_OPTIONS).status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === FORGOT PASSWORD: send OTP ===
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min

    await transporter.sendMail({
      from: `"LocalRent" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - LocalRent",
      text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: "OTP sent for password reset" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === RESET PASSWORD ===
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    const stored = otpStore[email];
    if (!stored) return res.status(400).json({ message: "OTP not found" });
    if (Date.now() > stored.expires) return res.status(400).json({ message: "OTP expired" });
    if (stored.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    delete otpStore[email];
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === PROFILE ===
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === UPDATE PROFILE ===
router.put("/profile", authMiddleware, async (req, res) => {
  const updates = (({ username, fullName, age, gender, phoneNumber, profileImage }) =>
    ({ username, fullName, age, gender, phoneNumber, profileImage }))(req.body);

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// === LOGOUT ===
router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
});



module.exports = router;


require("dotenv").config();
console.log("✅ Loaded .env variables:", process.env.PORT, process.env.MONGO_URI ? "Mongo URI OK" : "Missing");

console.log("2️⃣  Starting Express setup...");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

console.log("3️⃣  Creating app...");
const app = express();

// -------------------- Middleware --------------------
console.log("4️⃣  Applying middleware...");
app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// ✅ SAFE CORS (prevents hanging)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://vnsrooms.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

console.log("✅ CORS setup complete!");

// -------------------- Routes --------------------
console.log("5️⃣  Setting up routes...");
app.get("/", (req, res) => res.send("Server running 🚀"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import routes
const authRoutes = require("./routes/auth");
const heroRoutes = require("./routes/hero");
const pgDetailsRoutes = require("./routes/pgdetails");
const chatRoutes = require("./routes/chat");
const allUsersRoutes = require("./routes/allusers");
const allAdminsRoutes = require("./routes/alladmins");
const hostUserRoutes = require("./routes/hostUser");
const hostRoutes = require("./routes/host");
const wishlistRoutes = require("./routes/wishlist");
const adminStatsRoutes = require("./routes/adminStats");
const adminAuthRoutes = require("./routes/adminAuth");
const paymentRoutes = require("./routes/payment");
const bookingRoutes = require("./routes/booking");


// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/pgdetails", pgDetailsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/allusers", allUsersRoutes);
app.use("/api/alladmins", allAdminsRoutes);
app.use("/api/hostuser", hostUserRoutes);
app.use("/api/host", hostRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminStatsRoutes);
app.use("/api/adminAuth", adminAuthRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/bookings", bookingRoutes);



// -------------------- MongoDB Connection --------------------
console.log("6️⃣  Connecting to MongoDB...");
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing!");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected successfully");

    // Start server only after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

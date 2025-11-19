// const express = require("express");
// const router = express.Router();
// const Host = require("../models/Host");
// const mongoose = require("mongoose");
// const verifyUserToken = require("../middleware/auth"); // user JWT
// const verifyAdminToken = require("../middleware/authAdmin"); // admin JWT
// const multer = require("multer");

// const BASE_URL = "http://localhost:5000/uploads/host/";
// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/host"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// // ✅ CREATE host listing (User only)
// router.post("/create", verifyUserToken, upload.array("images", 10), async (req, res) => {
//   try {
//     const userId = req.user.userId; // from token
//     const { propertyType, roomType, pgType, bhkType, location, details, price, hostDetails, title, description, locationmap, } = req.body;

//     const images = req.files
//       ? req.files.map(file => `${BASE_URL}${file.filename}`)
//       : [];

//     const newHost = new Host({
//       userId,
//       propertyType,
//       pgType,
//       bhkType,
//       roomType,
//       location: JSON.parse(location),
//       details: JSON.parse(details),
//       price: JSON.parse(price),
//       hostDetails: JSON.parse(hostDetails),
//       title,
//       description,
//       locationmap: JSON.parse(locationmap),
//       images,
//     });

//     await newHost.save();
//     res.status(201).json({ success: true, host: newHost });
//   } catch (err) {
//     console.error("Error creating host listing:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ✅ GET all hosts (Admin only)
// router.get("/", verifyAdminToken, async (req, res) => {
//   try {
//     const hosts = await Host.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, hosts });
//   } catch (err) {
//     console.error("Error fetching hosts:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });



// // ✅ GET single host by ID (Admin only)
// router.get("/:id", verifyAdminToken, async (req, res) => {
//   try {
//     const hostId = req.params.id;

//     // Validate Mongo ID
//     if (!mongoose.Types.ObjectId.isValid(hostId)) {
//       return res.status(400).json({ success: false, message: "Invalid host ID" });
//     }

//     // Find host by ID
//     const host = await Host.findById(hostId);
//     if (!host) {
//       return res.status(404).json({ success: false, message: "Host not found" });
//     }

//     // Return found host
//     res.status(200).json({ success: true, host });
//   } catch (err) {
//     console.error("Error fetching host by ID:", err);
//     res.status(500).json({ success: false, message: "Server error while fetching host" });
//   }
// });


// // ✅ UPDATE host by ID (Admin only)
// router.put("/:id", verifyAdminToken, async (req, res) => {
//   try {
//     const hostId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(hostId))
//       return res.status(400).json({ success: false, message: "Invalid host ID" });

//     const host = await Host.findById(hostId);
//     if (!host) return res.status(404).json({ success: false, message: "Host not found" });

//     Object.assign(host, req.body);
//     await host.save();
//     res.json({ success: true, host });
//   } catch (err) {
//     console.error("Error updating host:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ✅ DELETE host by ID (Admin only)
// router.delete("/:id", verifyAdminToken, async (req, res) => {
//   try {
//     const hostId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(hostId))
//       return res.status(400).json({ success: false, message: "Invalid host ID" });

//     const host = await Host.findById(hostId);
//     if (!host) return res.status(404).json({ success: false, message: "Host not found" });

//     await Host.findByIdAndDelete(hostId);
//     res.json({ success: true, message: "Host deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting host:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });


// router.put("/:id/status", verifyAdminToken, async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   if (!["pending", "listed", "wrong"].includes(status)) {
//     return res.status(400).json({ success: false, message: "Invalid status value" });
//   }

//   try {
//     const host = await Host.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true, runValidators: true }
//     );

//     if (!host) return res.status(404).json({ success: false, message: "Host not found" });

//     res.json({ success: true, host });
//   } catch (err) {
//     console.error("Error updating host status:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const Host = require("../models/Host");
const mongoose = require("mongoose");
const verifyUserToken = require("../middleware/auth"); // User JWT
const verifyAdminToken = require("../middleware/authAdmin"); // Admin JWT
const multer = require("multer");
const fs = require("fs");

// ✅ Base URL for uploaded images
const BASE_URL = "http://localhost:5000/uploads/host/";

// ✅ Ensure upload directory exists
const uploadDir = "uploads/host";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ CREATE host listing (User only)
router.post("/create", verifyUserToken, upload.array("images", 10), async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT

    // Handle file URLs
    const images = req.files?.map(file => `${BASE_URL}${file.filename}`) || [];

    // Try to safely parse JSON fields
    const safeParse = (field) => {
      try {
        return field ? JSON.parse(field) : {};
      } catch {
        return field || {};
      }
    };

    const newHost = new Host({
      userId,
      propertyType: req.body.propertyType,
      pgType: req.body.pgType,
      bhkType: req.body.bhkType,
      roomType: req.body.roomType,
      location: safeParse(req.body.location),
      details: safeParse(req.body.details),
      price: safeParse(req.body.price),
      hostDetails: safeParse(req.body.hostDetails),
      title: req.body.title,
      description: req.body.description,
      locationmap: safeParse(req.body.locationmap),
      images,
    });

    await newHost.save();
    res.status(201).json({ success: true, host: newHost });
  } catch (err) {
    console.error("❌ Error creating host listing:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ GET all hosts (Admin only)
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const hosts = await Host.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, hosts });
  } catch (err) {
    console.error("❌ Error fetching hosts:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ GET single host by ID (Admin only)
router.get("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid host ID" });

    const host = await Host.findById(id);
    if (!host)
      return res.status(404).json({ success: false, message: "Host not found" });

    res.status(200).json({ success: true, host });
  } catch (err) {
    console.error("❌ Error fetching host by ID:", err);
    res.status(500).json({ success: false, message: "Server error while fetching host" });
  }
});

// // ✅ UPDATE host by ID (Admin only)
// router.put("/:id", verifyAdminToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(400).json({ success: false, message: "Invalid host ID" });

//     const host = await Host.findById(id);
//     if (!host)
//       return res.status(404).json({ success: false, message: "Host not found" });

//     Object.assign(host, req.body);
//     await host.save();

//     res.json({ success: true, host });
//   } catch (err) {
//     console.error("❌ Error updating host:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// ✅ UPDATE host by ID (Admin only)
router.put("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid host ID" });
    }

    const host = await Host.findById(id);
    if (!host) {
      return res.status(404).json({ success: false, message: "Host not found" });
    }

    // Directly merge req.body into host
    Object.assign(host, req.body);

    await host.save();

    res.json({ success: true, host });

  } catch (err) {
    console.error("❌ Error updating host:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ✅ DELETE host by ID (Admin only)
router.delete("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid host ID" });

    const host = await Host.findById(id);
    if (!host)
      return res.status(404).json({ success: false, message: "Host not found" });

    await Host.findByIdAndDelete(id);
    res.json({ success: true, message: "Host deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting host:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ UPDATE host status (Admin only)
router.put("/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "listed", "wrong"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const host = await Host.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!host)
      return res.status(404).json({ success: false, message: "Host not found" });

    res.json({ success: true, host });
  } catch (err) {
    console.error("❌ Error updating host status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

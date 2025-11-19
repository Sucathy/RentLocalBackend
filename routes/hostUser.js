// const express = require("express");
// const router = express.Router();
// const Host = require("../models/Host");
// const mongoose = require("mongoose");
// const multer = require("multer");

// const BASE_URL = "http://localhost:5000/uploads/host/";

// // ✅ Multer setup
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "uploads/host"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// /* ===========================================================
//    ✅ 1. CREATE Host Listing (User only)
// =========================================================== */
// router.post("/create", upload.array("images", 10), async (req, res) => {
//     try {
//         const {
//             propertyType,
//             roomType,
//             pgType,
//             bhkType,
//             location,
//             details,
//             price,
//             hostDetails,
//             title,
//             description,
//         } = req.body;

//         const images = req.files
//             ? req.files.map((file) => `${BASE_URL}${file.filename}`)
//             : [];

//         const newHost = new Host({
//             propertyType,
//             pgType,
//             bhkType,
//             roomType,
//             location: JSON.parse(location),
//             details: JSON.parse(details),
//             price: JSON.parse(price),
//             hostDetails: JSON.parse(hostDetails),
//             title,
//             description,
//             images,
//         });

//         await newHost.save();
//         res.status(201).json({ success: true, host: newHost });
//     } catch (err) {
//         console.error("❌ Error creating host:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// /* ===========================================================
//    ✅ 2. GET All Hosts
// =========================================================== */
// router.get("/", async (req, res) => {
//     try {
//         const hosts = await Host.find().sort({ createdAt: -1 });
//         res.status(200).json({ success: true, hosts });
//     } catch (err) {
//         console.error("❌ Error fetching hosts:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// /* ===========================================================
//    ✅ 3. GET Single Host
// =========================================================== */
// router.get("/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         if (!mongoose.Types.ObjectId.isValid(id))
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid ID format" });

//         const host = await Host.findById(id);
//         if (!host)
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Host not found" });

//         res.status(200).json({ success: true, host });
//     } catch (err) {
//         console.error("❌ Error fetching host:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// /* ===========================================================
//    ✅ 4. DELETE Host
// =========================================================== */
// router.delete("/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         if (!mongoose.Types.ObjectId.isValid(id))
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid ID format" });

//         await Host.findByIdAndDelete(id);
//         res
//             .status(200)
//             .json({ success: true, message: "Host deleted successfully" });
//     } catch (err) {
//         console.error("❌ Error deleting host:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// module.exports = router; // ✅ THIS IS CRUCIAL
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Host = require("../models/Host");
const verifyToken = require("../middleware/auth"); // ✅ verifies hostUser or user JWT

// ✅ Base URL for uploaded host images
const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000/uploads/host/";

/* ===========================================================
   ✅ Multer setup for image uploads
=========================================================== */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/host"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ===========================================================
   ✅ 1. CREATE Host Listing (Login Required)
=========================================================== */
router.post(
    "/user-create",
    verifyToken,
    upload.array("images", 10),
    async (req, res) => {
        try {
            const userId = req.user.userId; // ✅ from verified JWT
            const {
                propertyType,
                roomType,
                pgType,
                bhkType,
                location,
                details,
                price,
                hostDetails,
                title,
                description,
            } = req.body;

            // ✅ Safely parse JSON strings
            const safeParse = (data) => {
                try {
                    return typeof data === "string" ? JSON.parse(data) : data;
                } catch {
                    return data;
                }
            };

            // ✅ Handle images
            const images = req.files ? req.files.map((f) => `${BASE_URL}${f.filename}`) : [];

            // ✅ Create host listing
            const newHost = new Host({
                userId,
                propertyType,
                pgType,
                bhkType,
                roomType,
                location: safeParse(location),
                details: safeParse(details),
                price: safeParse(price),
                hostDetails: safeParse(hostDetails),
                title,
                description,
                images,
            });

            await newHost.save();
            res.status(201).json({
                success: true,
                message: "Host listing created successfully",
                host: newHost,
            });
        } catch (err) {
            console.error("❌ Error creating host:", err);
            res.status(500).json({
                success: false,
                message: "Failed to create host",
                error: err.message,
            });
        }
    }
);

/* ===========================================================
   ✅ 2. GET Host Listings (Logged-in HostUser only)
=========================================================== */
router.get("/user-my", verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const hosts = await Host.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, listings: hosts });
    } catch (err) {
        console.error("❌ Error fetching host listings:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch host listings",
            error: err.message,
        });
    }
});


router.get("/user/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid host ID" });

        const host = await Host.findById(id);
        if (!host) return res.status(404).json({ success: false, message: "Host not found" });

        if (host.userId.toString() !== req.user.userId)
            return res.status(403).json({ success: false, message: "Unauthorized" });

        res.status(200).json({ success: true, listing: host });
    } catch (err) {
        console.error("Error fetching host:", err);
        res.status(500).json({ success: false, message: "Failed to fetch listing", error: err.message });
    }
});

/* ===========================================================
   4. UPDATE Listing by ID
=========================================================== */
router.put("/user/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid host ID" });

        const host = await Host.findById(id);
        if (!host) return res.status(404).json({ success: false, message: "Host not found" });

        if (host.userId.toString() !== req.user.userId)
            return res.status(403).json({ success: false, message: "Unauthorized" });

        Object.assign(host, updates); // Update all fields
        await host.save();

        res.status(200).json({ success: true, message: "Listing updated successfully", listing: host });
    } catch (err) {
        console.error("Error updating host:", err);
        res.status(500).json({ success: false, message: "Failed to update listing", error: err.message });
    }
});

/* ===========================================================
   ✅ 3. DELETE Host Listing (Owner Only)
=========================================================== */
router.delete("/user/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid host ID" });
        }

        const host = await Host.findById(id);
        if (!host) {
            return res.status(404).json({ success: false, message: "Host not found" });
        }

        if (host.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await host.deleteOne();
        res.status(200).json({ success: true, message: "Host deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting host:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;

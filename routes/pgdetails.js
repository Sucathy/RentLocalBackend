
const express = require("express");
const router = express.Router();
const multer = require("multer");
const PgDetail = require("../models/PgDetail");
const Host = require("../models/Host");
const Booking = require("../models/Booking");
const verifyToken = require("../middleware/auth");
const nodemailer = require("nodemailer");

const storage = multer.memoryStorage();
const upload = multer({ storage });


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "surreshsu6363@gmail.com",
    pass: process.env.EMAIL_PASS || "yfsn nfnp snnh edxl",
  },
});

/* ------------------------- Helper: Format Location ------------------------- */
function formatLocation(location) {
  if (!location) return "";

  return `
    ${location.street || ""}, 
    ${location.landmark || ""}, 
    ${location.city || ""}, 
    ${location.state || ""}, 
    ${location.country || ""}
  `.replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
}

/* ----------------------------- GET All PGs ----------------------------- */
router.get("/", async (req, res) => {
  try {
    const locationQuery = req.query.location;

    const results = await PgDetail.find(
      locationQuery
        ? { location: { $regex: locationQuery, $options: "i" } }
        : {}
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* --------------------------- GET PG by ID --------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const pg = await PgDetail.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found." });
    res.json(pg);
  } catch {
    res.status(400).json({ message: "Invalid PG ID." });
  }
});


router.post("/", upload.any(), async (req, res) => {
  try {
    // 🟢 Read textual fields from FormData
    const {
      title,
      location,
      latitude,
      longitude,
      price,
      description,
      propertyType,
      pgType,
      bhkType,
    } = req.body;

    if (!title || !location || !description || !propertyType || !price) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    // 🟢 Parse JSON fields
    const details = req.body.details ? JSON.parse(req.body.details) : {};
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];

    // 🟢 Existing image URLs
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    // 🟢 File uploads (convert file buffers to base64 or store on cloud later)
    const uploadedImages = req.files?.map((file) =>
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    ) || [];

    const finalImages = [...existingImages, ...uploadedImages];

    // 🟢 SAVE to DB
    const pg = await PgDetail.create({
      title,
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      price: Number(price),
      description,
      propertyType,
      pgType: pgType || null,
      bhkType: bhkType || null,

      images: finalImages,

      amenities: amenities.map((a) => ({
        name: a.name,
        type: a.type,
      })),

      deposit: req.body.deposit ? JSON.parse(req.body.deposit) : {},

      details: {
        guests: Number(details.guests || 0),
        bedrooms: Number(details.bedrooms || 0),
        beds: Number(details.beds || 0),
        bathrooms: Number(details.bathrooms || 0),
      },

      bookedRanges: [],
    });

    res.status(201).json({ success: true, data: pg });
  } catch (err) {
    console.error("Error creating PG:", err);
    res.status(500).json({ message: err.message });
  }
});


/* --------------------------- BOOK DATE-RANGE --------------------------- */
router.patch("/:id/book-range", verifyToken, async (req, res) => {
  try {
    const { from, to, totalAmount, userEmail, userName } = req.body;
    const userId = req.user.userId;

    if (!from || !to)
      return res.status(400).json({ message: "Both dates required." });

    const pg = await PgDetail.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found." });

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate >= toDate)
      return res.status(400).json({ message: "Invalid date range." });

    // Check overlapping dates
    const overlap = pg.bookedRanges.some((r) => {
      const rFrom = new Date(r.from);
      const rTo = new Date(r.to);
      return fromDate <= rTo && toDate >= rFrom;
    });

    if (overlap)
      return res.status(400).json({ message: "Dates already booked." });

    // Save booked dates
    pg.bookedRanges.push({ from: fromDate, to: toDate });
    await pg.save();

    // Save booking
    await Booking.create({
      userId,
      pgId: pg._id,
      checkIn: fromDate,
      checkOut: toDate,
      totalAmount,
      paymentStatus: "Paid",
    });

    // Send email only if userEmail exists
    if (userEmail) {
      transporter.sendMail(
        {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: `Booking Invoice - ${pg.title}`,
          html: `
            <h2>Booking Confirmed</h2>
            <p>Hi ${userName}, your booking is confirmed!</p>
            <p><b>Check-in:</b> ${fromDate.toDateString()}</p>
            <p><b>Check-out:</b> ${toDate.toDateString()}</p>
            <p><b>Total Amount:</b> ₹${totalAmount}</p>
            <p><b>Location:</b> ${pg.location}</p>
            <p>— PG Local Team</p>
          `,
        },
        (err) => err && console.error("Email error:", err)
      );
    }

    res.json({
      message: "Booking successful",
      bookedRange: { from: fromDate, to: toDate },
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------ GET PG Booked Ranges ------------------------ */
router.get("/:id/calendar", async (req, res) => {
  try {
    const pg = await PgDetail.findById(req.params.id).select("bookedRanges");
    if (!pg) return res.status(404).json({ message: "PG not found" });

    res.json(pg.bookedRanges);
  } catch (err) {
    console.error("Error fetching booked ranges:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------- UPDATE PG --------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      location,
      latitude,
      longitude,
      price,
      description,
      propertyType,
      pgType,
      bhkType,
      images,
      amenities,
      deposit,
      details,
    } = req.body;

    const updated = await PgDetail.findByIdAndUpdate(
      req.params.id,
      {
        title,
        location,
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
        price: parseFloat(price),
        description,
        propertyType,
        pgType,
        bhkType,
        images,
        amenities,
        deposit,
        details,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "PG not found." });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* --------------------------- DELETE PG --------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await PgDetail.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "PG not found." });

    res.json({ message: "PG deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------- SYNC PG FROM HOST ----------------------- */
router.post("/host-sync", async (req, res) => {
  try {
    const { hostId } = req.body;

    if (!hostId) return res.status(400).json({ message: "hostId required" });

    const host = await Host.findById(hostId);
    if (!host) return res.status(404).json({ message: "Host not found" });

    const existingPg = await PgDetail.findOne({ hostId });
    if (existingPg)
      return res.json({
        success: true,
        message: "PG already exists",
        pg: existingPg,
      });

    const newPg = await PgDetail.create({
      hostId,
      title: host.title,
      location: formatLocation(host.location),
      latitude: host.locationmap?.latitude || 0,
      longitude: host.locationmap?.longitude || 0,
      price: host.price?.monthly || 1000,
      propertyType: host.propertyType || "PG",
      pgType: host.pgType || null,
      bhkType: host.bhkType || null,
      images: host.images || [],
      amenities: host.amenities || [],
      description: host.description || "",
      deposit: host.deposit || {},
      details: host.details || {},
      bookedRanges: [],
    });

    res.json({ success: true, message: "PG created successfully", pg: newPg });
  } catch (err) {
    console.error("Host-sync error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------- DELETE PG BY HOST ID ---------------------- */
router.delete("/host/:hostId", async (req, res) => {
  try {
    const pg = await PgDetail.findOneAndDelete({ hostId: req.params.hostId });

    if (!pg)
      return res.json({
        success: false,
        message: "No PG found for this hostId",
      });

    res.json({
      success: true,
      message: "PG deleted because host was set to pending",
    });
  } catch (err) {
    console.error("Error deleting PG:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

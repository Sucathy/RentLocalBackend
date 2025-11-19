// const express = require("express");
// const router = express.Router();
// const Message = require("../models/Message");
// const verifyToken = require("../middleware/auth"); // JWT verification

// // Get all messages between user and host
// router.get("/conversation/:hostId/:userId", verifyToken, async (req, res) => {
//     try {
//         const { hostId, userId } = req.params;
//         const messages = await Message.find({ hostId, userId }).sort({ createdAt: 1 });
//         res.json({ success: true, messages });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: "Failed to fetch messages" });
//     }
// });

// // Send a message
// router.post("/", verifyToken, async (req, res) => {
//     try {
//         const { hostId, userId, text, sender } = req.body;
//         const newMessage = new Message({ hostId, userId, text, sender });
//         await newMessage.save();
//         res.json({ success: true, message: newMessage });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: "Failed to send message" });
//     }
// });

// module.exports = router;

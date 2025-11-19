const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: String, enum: ["Host", "User"] },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);

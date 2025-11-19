const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PgDetail",
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

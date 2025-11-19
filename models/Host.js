const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyType: { type: String, required: true },
    roomType: { type: String, required: true },
    pgType: { type: String, },
    bhkType: { type: String, },
    location: {
      country: String,
      state: String,
      city: String,
      street: String,
      landmark: String,
      locality: String,
      pincode: String,
    },
    locationmap: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    details: {
      guests: { type: Number, default: 0 },
      bedrooms: { type: Number, default: 0 },
      beds: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
    },
    images: [{ type: String }],
    price: {
      monthly: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 100 }, // Fixed ₹100 service fee
      deposit: {
        pgDeposit: {
          type: Object,
          default: {
            advance: 50000,
          },
        },
        houseDeposit: {
          type: Object,
          default: {
            "1BHK": 50000,
            "2BHK": 60000,
            "3BHK": 80000,
            "4BHK": 120000,
          },
        },
        flatDeposit: {
          type: Object,
          default: {
            "1BHK": 70000,
            "2BHK": 80000,
            "3BHK": 90000,
            "4BHK": 150000,
          },
        },
      },
    },

    hostDetails: {
      name: { type: String, default: "" },
      contact: { type: String, default: "" },
    },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "listed", "wrong"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Host", hostSchema);

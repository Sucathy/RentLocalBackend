const mongoose = require("mongoose");

const pgDetailSchema = new mongoose.Schema({
  hostId: {                                  // ← ADD THIS
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host",
    required: false
  },
  title: { type: String, required: true },
  propertyType: { type: String, required: true },
  pgType: { type: String, },
  bhkType: { type: String },
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  price: { type: Number },
  details: {
    guests: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 0 },
    beds: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
  },
  deposit: {
    pgDeposit: {
      amount: { type: Number, default: 3000 },
      refundableNote: { type: String, default: "You'll get half back when leaving." },
    },
    houseDeposit: {
      type: Object,
      default: {
        "1bhk": 50000,
        "2bhk": 60000,
        "3bhk": 80000,
        "4bhk": 120000,
      },
    },
    flatDeposit: {
      type: Object,
      default: {
        "1bhk": 70000,
        "2bhk": 80000,
        "3BHK": 90000,
        "4BHK": 150000,
      },
    },
  },
  description: { type: String, required: false },
  images: [{ type: String }],
  amenities: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
  bookedRanges: [
    {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
  ],
});

module.exports = mongoose.model("PgDetail", pgDetailSchema);

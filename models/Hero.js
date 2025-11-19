const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
  url: { type: String, required: true },
});

module.exports = mongoose.model("Hero", heroSchema);

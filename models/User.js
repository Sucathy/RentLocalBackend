const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, default: "" },
  age: { type: Number, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
  profileImage: { type: String, default: "" }, // keep only one
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
});

module.exports = mongoose.model("User", UserSchema);

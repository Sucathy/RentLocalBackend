const mongoose = require("mongoose");

const WishListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: "PgDetail", required: true }, // must match PgDetail
});

module.exports = mongoose.model("WishList", WishListSchema);

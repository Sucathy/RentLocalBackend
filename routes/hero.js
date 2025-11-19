const express = require("express");
const router = express.Router();
const Hero = require("../models/Hero");

// Get all hero images
router.get("/", async (req, res) => {
  try {
    const images = await Hero.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new image
router.post("/", async (req, res) => {
  const hero = new Hero({ url: req.body.url });
  try {
    const newHero = await hero.save();
    res.status(201).json(newHero);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update image
router.put("/:id", async (req, res) => {
  try {
    const updatedHero = await Hero.findByIdAndUpdate(
      req.params.id,
      { url: req.body.url },
      { new: true }
    );
    res.json(updatedHero);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete image
router.delete("/:id", async (req, res) => {
  try {
    await Hero.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

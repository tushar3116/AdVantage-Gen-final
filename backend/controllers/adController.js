const Ad = require("../models/Ad");
const generateTagline = require("../utils/generateTagline");
const generateTags = require("../utils/generateTags");
const generateImage = require("../services/stabilityAI");
const uploadImage = require("../services/cloudinaryUpload");

// POST /api/ads/generate
exports.generateAd = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    console.log("Generating ad for prompt:", prompt);

    // ── Step 1: Generate tagline & tags ──
    const tagline = generateTagline(prompt);
    const tags = generateTags(prompt);

    console.log("Generated tagline:", tagline);
    console.log("Generated tags:", tags);

    // ── Step 2: Generate image with Stability AI ──
    const imageBuffer = await generateImage(prompt);

    // ── Step 3: Upload image to Cloudinary ──
    const imageUrl = await uploadImage(imageBuffer);

    // ── Step 4: Save to MongoDB ──
    const newAd = new Ad({
      prompt,
      imageUrl,
      tags,
      tagline,
    });

    await newAd.save();
    console.log("Ad saved to DB with id:", newAd._id);

    res.status(201).json(newAd);
  } catch (error) {
    console.error("Error generating ad:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET /api/ads/:id
exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

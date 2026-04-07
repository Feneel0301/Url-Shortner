import express from "express";
import { nanoid } from "nanoid";
import Url from "../models/Url.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { originalUrl } = req.body;
    let shortCode = nanoid(7);

    let exists = await Url.findOne({ shortCode });
    while (exists) {
      shortCode = nanoid(7);
      exists = await Url.findOne({ shortCode });
    }
    const url = await Url.create({
      userId: req.user._id,
      shortCode,
      originalUrl,
    });
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    res.status(201).json({ shortUrl, shortCode, originalUrl });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ message: "not found" });

    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "not authorized" });
    }
    await url.deleteOne();
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
});
export default router;

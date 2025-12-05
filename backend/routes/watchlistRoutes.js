import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add to Watchlist
router.post("/add", protect, async (req, res) => {
  try {
    const { movieId, title, poster, rating, genres } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ message: "Movie ID and title are required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyExists = user.watchlist.some((m) => m.movieId === movieId);
    if (alreadyExists) {
      return res.status(400).json({ message: "Movie already in watchlist" });
    }

    user.watchlist.push({ movieId, title, poster, rating, genres });
    await user.save();

    res.status(201).json({ message: "Added to Watchlist", watchlist: user.watchlist });
  } catch (error) {
    console.error("Add to watchlist error:", error);
    res.status(500).json({ message: "Server error while adding to watchlist" });
  }
});

// Get Watchlist
router.get("/get", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ watchlist: user.watchlist });
  } catch (error) {
    console.error("Get watchlist error:", error);
    res.status(500).json({ message: "Server error while retrieving watchlist" });
  }
});

// Remove from Watchlist
router.delete("/remove/:movieId", protect, async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.watchlist = user.watchlist.filter((m) => m.movieId !== movieId);
    await user.save();

    res.json({ message: "Removed from watchlist", watchlist: user.watchlist });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    res.status(500).json({ message: "Server error while removing from watchlist" });
  }
});

export default router;

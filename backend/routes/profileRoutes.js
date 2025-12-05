import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👉 Get Profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

// 👉 Update Name + Profile Color
router.put("/update", protect, async (req, res) => {
  try {
    const { name, profileColor } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, profileColor },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

// 👉 Update Password
router.put("/update-password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated" });
  } catch {
    res.status(500).json({ message: "Failed to update password" });
  }
});

export default router;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ⭐ PREVIOUS WATCHLIST (unchanged)
    watchlist: [
      {
        movieId: { type: String, required: true },
        title: { type: String, required: true },
        poster: String,
        rating: Number,
        genres: [String],
      }
    ],

    // ⭐ NEW — PROFILE IMAGE (Base64)
    profileImage: {
      type: String,
      default: "",
    },

    // ⭐ NEW — USER COLOR THEME
    color: {
      type: String,
      default: "#5678ff",
    },

    // ⭐ NEW — WATCH HISTORY
    watchHistory: [
      {
        movieId: String,
        title: String,
        poster: String,
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],

    // ⭐ NEW — PRIVATE WATCHLIST OPTION
    privateWatch: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

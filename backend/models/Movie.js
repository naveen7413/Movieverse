import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: String,
    poster: String,
    rating: Number,
    genre: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Movie", movieSchema);

import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    await Movie.deleteMany(); // optional – clears old data

    await Movie.insertMany([
      {
        title: "Inception",
        poster: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
        rating: 8.8,
        genre: ["Sci-Fi", "Thriller"],
      },
      {
        title: "Interstellar",
        poster: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
        rating: 8.6,
        genre: ["Sci-Fi", "Drama"],
      },
      {
        title: "The Dark Knight",
        poster: "https://image.tmdb.org/t/p/w500/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg",
        rating: 9.0,
        genre: ["Action", "Crime"],
      },
    ]);

    console.log("Movies inserted successfully!");
    process.exit();
  })
  .catch((err) => console.log(err));

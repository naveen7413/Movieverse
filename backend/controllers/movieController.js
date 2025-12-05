import Movie from "../models/Movie.js";

export const addMovie = async (req, res) => {
  try {
    await Movie.create(req.body);
    res.json({ success: true, message: "Movie Added" });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.json({ error: error.message });
  }
};

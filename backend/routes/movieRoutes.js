import express from "express";
import { addMovie, getMovies } from "../controllers/movieController.js";

const router = express.Router();

router.post("/add", addMovie);
router.get("/", getMovies);

export default router;

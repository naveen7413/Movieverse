import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/tmdb";
import { API as BackendAPI } from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const MovieDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [movie, setMovie] = useState({});
  const [trailer, setTrailer] = useState("");
  const [related, setRelated] = useState([]);
  const [added, setAdded] = useState(false);

  // Load Movie
  const loadMovie = async () => {
    const res = await API.get(`/movie/${id}`);
    setMovie(res.data);
  };

  // Load Trailer
  const loadTrailer = async () => {
    const res = await API.get(`/movie/${id}/videos`);
    const ytTrailer = res.data.results.find(v => v.type === "Trailer");
    if (ytTrailer) setTrailer(`https://www.youtube.com/embed/${ytTrailer.key}`);
  };

  // Load Related Movies
  const loadRelated = async () => {
    const res = await API.get(`/movie/${id}/similar`);
    setRelated(res.data.results || []);
  };

  // Add to Watchlist (Fixed)
  const addToWatchlist = async () => {
    if (!token) return alert("Please login to add to watchlist!");

    try {
      const res = await BackendAPI.post(
        "/watchlist/add",
        {
          movieId: movie.id, // ⭐ FIXED
          title: movie.title,
          poster: `${import.meta.env.VITE_TMDB_IMG}${movie.poster_path}`, // ⭐ FIXED
          rating: movie.vote_average,
          genres: movie.genres?.map(g => g.name) || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message);
      setAdded(true);
    } catch (err) {
      console.error("Add to watchlist error:", err);
      alert(err.response?.data?.message || "Failed to add to watchlist");
    }
  };

  useEffect(() => {
    loadMovie();
    loadTrailer();
    loadRelated();
    setAdded(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  return (
    <div className="details-container">
      {/* Banner */}
      <div
        className="banner"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${import.meta.env.VITE_TMDB_IMG}${movie.backdrop_path})`,
        }}
      >
        <div className="banner-overlay">
          <h1>{movie.title}</h1>
          <p>{movie.overview}</p>

          <p><strong>Release:</strong> {movie.release_date}</p>
          <p><strong>Rating:</strong> ⭐ {movie.vote_average}</p>

          {token && (
            <button
              onClick={addToWatchlist}
              disabled={added}
              className={`watchlist-btn ${added ? "added" : ""}`}
            >
              {added ? "Added ✅" : "Add to Watchlist"}
            </button>
          )}
        </div>
      </div>

      {/* Trailer */}
      {trailer && (
        <div className="trailer-box">
          <iframe src={trailer} allowFullScreen title="trailer" />
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="related-movies">
          <h2>Related Movies</h2>

          <div className="movie-grid">
            {related.map(m => (
              <Link to={`/movie/${m.id}`} key={m.id} className="movie-card">
                <img
                  src={`${import.meta.env.VITE_TMDB_IMG}${m.poster_path}`}
                  alt={m.title}
                />
                <div className="overlay">
                  <h3>{m.title}</h3>
                  <p>⭐ {m.vote_average}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;

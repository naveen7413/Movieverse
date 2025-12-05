import { useEffect, useState, useRef, useCallback } from "react";
import API from "../utils/tmdb";
import { Link } from "react-router-dom";
import "./movies.css";

const categoryList = [
  { id: "28", label: "Action" },
  { id: "12", label: "Adventure" },
  { id: "16", label: "Animation" },
  { id: "35", label: "Comedy" },
  { id: "80", label: "Crime" },
  { id: "99", label: "Documentary" },
  { id: "18", label: "Drama" },
  { id: "14", label: "Fantasy" },
  { id: "27", label: "Horror" },
  { id: "9648", label: "Mystery" },
  { id: "10749", label: "Romance" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Thriller" },
  { id: "10752", label: "War" }
];

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [top10, setTop10] = useState([]);
  const [active, setActive] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);

  // ---------------------------------------------------
  // 🔥 LOAD GLOBAL TOP 10 OR CATEGORY TOP 10
  // ---------------------------------------------------

  const loadTop10 = async (genreId = null) => {
    try {
      let res;

      if (!genreId) {
        // GLOBAL TOP 10
        res = await API.get("/trending/movie/day");
        setTop10(res.data.results.slice(0, 10));
      } else {
        // CATEGORY TOP 10
        res = await API.get(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=1`);
        setTop10(res.data.results.slice(0, 10));
      }
    } catch (err) {
      console.log("Top 10 error:", err);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    loadTop10(); // load global top 10
  }, []);

  // CATEGORY CHANGE → NEW TOP 10
  useEffect(() => {
    loadTop10(active);
  }, [active]);

  // ---------------------------------------------------
  // 🔥 LOAD MOVIES (Infinite Scroll)
  // ---------------------------------------------------

  const loadMovies = async (genreId = null, pg = 1) => {
    setLoading(true);

    let res;
    if (!genreId) {
      res = await API.get(`/movie/popular?page=${pg}`);
    } else {
      res = await API.get(`/discover/movie?with_genres=${genreId}&page=${pg}`);
    }

    setMovies((prev) => [...prev, ...res.data.results]);
    setLoading(false);
  };

  useEffect(() => {
    loadMovies(active, page);
  }, [page, active]);

  const handleFilter = (genreId) => {
    setActive(genreId);
    setMovies([]);
    setPage(1);
  };

  // ---------------------------------------------------
  // 🔥 INFINITE SCROLL OBSERVER
  // ---------------------------------------------------
  const loadMoreOnScroll = useCallback(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [loading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(loadMoreOnScroll, {
      threshold: 1,
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loadMoreOnScroll]);

  return (
    <div className="page">

      {/* ⭐ STICKY CATEGORY BAR */}
      <div className="category-sticky-wrapper">
        <div className="filter-container">
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${active === cat.id ? "active" : ""}`}
              onClick={() => handleFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ⭐ HORIZONTAL TOP 10 SCROLLER */}
      <div className="top10-section">
        <h3>{active ? "🔥 Top 10 in this Category" : "🔥 Global Top 10 Movies"}</h3>

        <div className="top10-scroll">
          {top10.map((m) => (
            <Link key={m.id} to={`/movie/${m.id}`} className="top10-card">
              <img
                src={`${import.meta.env.VITE_TMDB_IMG}${m.poster_path}`}
                alt={m.title}
              />
              <span className="rank-number">{m.vote_average.toFixed(1)}</span>
              <p>{m.title}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ⭐ MOVIE GRID */}
      <div className="movie-grid">
        {movies.map((movie) => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
            <img
              src={`${import.meta.env.VITE_TMDB_IMG}${movie.poster_path}`}
              alt={movie.title}
            />
            <div className="overlay">
              <p>View Details</p>
            </div>
          </Link>
        ))}
      </div>

      {/* LOADING */}
      <div ref={loaderRef} style={{ padding: "20px", textAlign: "center" }}>
        {loading && <p style={{ color: "white" }}>Loading more...</p>}
      </div>
    </div>
  );
};

export default Movies;

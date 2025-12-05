// HeroBanner.jsx
import { useEffect, useState } from "react";
import "../styles/hero.css";

/**
 * Slide-by-one hero banner. Auto moves every 5s.
 * Props:
 *  - movies: array from TMDB
 *  - onOpenTrailer(ytKey)
 */
const HeroBanner = ({ movies = [], onOpenTrailer }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!movies.length) return;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % movies.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [movies]);

  const movie = movies[index] || {};

  const openTrailer = async () => {
    // fetch videos for this movie and pick a YouTube trailer
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_KEY}`);
      const data = await res.json();
      const yt = data.results?.find(v => v.site === "YouTube" && v.type === "Trailer");
      if (yt && onOpenTrailer) onOpenTrailer(yt.key);
    } catch (err) {
      console.error("Hero trailer fetch error:", err);
    }
  };

  return (
    <div
      className="hero-banner"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${import.meta.env.VITE_TMDB_IMG}${movie.backdrop_path})`
      }}
    >
      <div className="hero-inner">
        <h1 className="hero-title">{movie.title}</h1>
        <p className="hero-overview">{movie.overview}</p>

        <div className="hero-actions">
          <button className="btn primary" onClick={() => window.location.href = `/movie/${movie.id}`}>Info</button>
          <button className="btn ghost" onClick={openTrailer}>Watch Trailer</button>
        </div>
      </div>

      <div className="hero-thumbs">
        {movies.slice(0, 6).map((m, i) => (
          <div
            key={m.id}
            className={`hero-thumb ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          >
            <img src={`${import.meta.env.VITE_TMDB_IMG}${m.poster_path}`} alt={m.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

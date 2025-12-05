// MovieRow.jsx
import { useEffect, useRef } from "react";
import "../styles/movieRow.css";

/**
 * Continuous smooth scroll row.
 * - Duplicates movie items to create seamless loop
 * - Pauses on mouse hover (via CSS animation-play-state)
 *
 * props:
 *  - movies: array
 *  - onOpenTrailer(ytKey)
 */
const MovieRow = ({ movies = [], onOpenTrailer }) => {
  const containerRef = useRef();

  useEffect(() => {
    // make sure there are at least items
    // nothing fancy needed here; CSS handles animation
  }, [movies]);

  const handleClick = async (movieId) => {
    // fetch trailer key and call parent
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${import.meta.env.VITE_TMDB_KEY}`);
      const data = await res.json();
      const yt = data.results?.find(v => v.site === "YouTube" && v.type === "Trailer");
      if (yt && onOpenTrailer) onOpenTrailer(yt.key);
    } catch (err) {
      console.error("MovieRow trailer fetch:", err);
    }
  };

  // build duplicated list for seamless effect
  const list = [...movies, ...movies];

  return (
    <div
      className="movie-row"
      ref={containerRef}
      // pause on hover via CSS
    >
      <div className="movie-track">
        {list.map((m, idx) => (
          <div
            key={`${m.id}-${idx}`}
            className="movie-tile"
            onClick={() => handleClick(m.id)}
            title={m.title}
          >
            <img src={`${import.meta.env.VITE_TMDB_IMG}${m.poster_path}`} alt={m.title} />
            <div className="tile-overlay">
              <p className="tile-title">{m.title}</p>
              <p className="tile-rating">⭐ {m.vote_average}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieRow;

// Home.jsx
import { useEffect, useState, useRef } from "react";
import API from "../utils/tmdb";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import TrailerPopup from "../components/TrailerPopup";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [rows, setRows] = useState([]);
  const [trailer, setTrailer] = useState("");
  const trailerRef = useRef(null);

  const categories = [
    { key: "trending", title: "Trending Today", url: "/trending/movie/day" },
    { key: "popular", title: "Popular Movies", url: "/movie/popular" },
    { key: "now", title: "Now Playing", url: "/movie/now_playing" },
    { key: "upcoming", title: "Upcoming Movies", url: "/movie/upcoming" },
    { key: "top", title: "Top Rated Hits", url: "/movie/top_rated" },
  ];

  useEffect(() => {
    const loadHome = async () => {
      try {
        const hero = await API.get("/trending/movie/day");
        setHeroMovies(hero.data.results || []);

        const promises = categories.map(c => API.get(`${c.url}?page=1`));
        const results = await Promise.all(promises);

        const mapped = results.map((r, idx) => ({
          key: categories[idx].key,
          title: categories[idx].title,
          movies: r.data.results || []
        }));

        setRows(mapped);
      } catch (err) {
        console.error("Home load error:", err);
      }
    };

    loadHome();
  }, []);

  const openTrailer = (key) => {
    if (!key) return;
    setTrailer(`https://www.youtube.com/embed/${key}?autoplay=1`);
    setTimeout(() => trailerRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  };

  return (
    <div className="home-page">

      {/* HERO BANNER (Click to open movie details) */}
      <div className="hero-wrapper">
        {heroMovies.length > 0 && (
          <Link to={`/movie/${heroMovies[0].id}`}>
            <HeroBanner movies={heroMovies} onOpenTrailer={openTrailer} />
          </Link>
        )}
      </div>

      {/* MOVIE ROWS */}
      <div className="rows-wrapper">
        {rows.map(row => (
          <section key={row.key} className="row-section">
            <div className="row-header">
              <h3>{row.title}</h3>
            </div>

            {/* Each MovieRow item must open Movie.jsx on click */}
            <MovieRow
              movies={row.movies}
              onOpenTrailer={openTrailer}
              clickable
            />
          </section>
        ))}

        {/* ⭐ TOP 10 SECTION (also clickable now) */}
        <div className="top10">
          <h3>🔥 Top 10 on MovieVerse Today</h3>

          <div className="top10-grid">
            {rows
              .find(r => r.key === "trending")
              ?.movies.slice(0, 10)
              .map(m => (
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
      </div>

      <div ref={trailerRef}></div>

      <TrailerPopup src={trailer} onClose={() => setTrailer("")} />
    </div>
  );
};

export default Home;

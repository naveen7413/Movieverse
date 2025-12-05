// Recommend.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import "../styles/recommend.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const IMG = import.meta.env.VITE_TMDB_IMG;

// BASE ROWS
const BASE_CATEGORIES = [
  { key: "featured", title: "Featured", url: "/trending/movie/week" },
  { key: "popular", title: "Popular", url: "/movie/popular" },
  { key: "recent", title: "Recently Released", url: "/movie/now_playing" },
  { key: "upcoming", title: "Upcoming", url: "/movie/upcoming" },
  { key: "top", title: "Top Rated", url: "/movie/top_rated" },
];

// genre filter for UI (used by AI prompt detection too)
const GENRES = [
  { id: "", name: "All" },
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 27, name: "Horror" },
  { id: 10751, name: "Family" },
];

const MOODS = [
  { key: "neutral", label: "Any" },
  { key: "happy", label: "Happy" },
  { key: "sad", label: "Sad" },
  { key: "action", label: "Action" },
  { key: "sci_fi", label: "Sci-Fi" },
  { key: "family", label: "Family" },
];

export default function Recommend() {
  const { token } = useContext(AuthContext);

  // states (existing)
  const [selectedCategory, setSelectedCategory] = useState("featured");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMood, setSelectedMood] = useState("neutral");

  const [hasPicked, setHasPicked] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const [heroMovies, setHeroMovies] = useState([]);
  const [rows, setRows] = useState([]);
  const [top10, setTop10] = useState([]);

  const [trailerKey, setTrailerKey] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);

  // PROMPT FEATURE STATES
  const [promptText, setPromptText] = useState("");
  const [promptResults, setPromptResults] = useState([]);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptLabel, setPromptLabel] = useState("");
  const [selectedPromptMovie, setSelectedPromptMovie] = useState(null);
  const [similarForPrompt, setSimilarForPrompt] = useState({}); // map movieId -> array

  // URL builder
  const buildUrl = (endpoint, genreId) => {
    if (genreId)
      return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;

    return `${BASE_URL}${endpoint}?api_key=${API_KEY}`;
  };

  // AI scoring (reused)
  const applyAIScoring = (movies) => {
    return movies
      .map((movie) => {
        let score = movie.vote_average;

        if (selectedMood === "happy") score += movie.popularity * 0.01;
        if (selectedMood === "sad") score += (10 - movie.vote_average) * 0.3;
        if (selectedMood === "action" && movie.genre_ids?.includes(28)) score += 2;
        if (selectedMood === "sci_fi" && movie.genre_ids?.includes(878)) score += 2;
        if (selectedMood === "family" && movie.genre_ids?.includes(10751)) score += 2;

        if (selectedGenre && movie.genre_ids?.includes(Number(selectedGenre))) score += 1.5;

        return { ...movie, aiScore: score };
      })
      .sort((a, b) => b.aiScore - a.aiScore);
  };

  // MAIN AI PICK (unchanged)
  const handleAIPick = async () => {
    try {
      setAiThinking(true);
      setHasPicked(false);
      setRows([]);
      setHeroMovies([]);
      setTop10([]);

      await new Promise((r) => setTimeout(r, 600)); // smooth AI feeling

      // HERO FETCH
      const endpoint =
        selectedCategory === "featured"
          ? `/trending/movie/week`
          : BASE_CATEGORIES.find((c) => c.key === selectedCategory)?.url;

      const heroRes = await axios.get(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
      setHeroMovies(applyAIScoring(heroRes.data.results || []));

      // ROW FETCH
      const rowPromises = BASE_CATEGORIES.map((cat) =>
        axios.get(buildUrl(cat.url, selectedGenre)).then((res) => ({
          key: cat.key,
          title: cat.title,
          movies: applyAIScoring(res.data.results || []),
        }))
      );

      const fetchedRows = await Promise.all(rowPromises);
      setRows(fetchedRows);

      // TOP 10 picks (AI weighted)
      const allMovies = fetchedRows.flatMap((row) => row.movies);
      const unique = Array.from(new Map(allMovies.map((m) => [m.id, m])).values());
      setTop10(unique.slice(0, 10));

      setHasPicked(true);
    } catch (e) {
      console.error(e);
    } finally {
      setAiThinking(false);
    }
  };

  // Trailer
  const openTrailer = async (id) => {
    try {
      const r = await axios.get(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`);
      const t = r.data.results.find((x) => x.site === "YouTube") || r.data.results[0];
      if (t) setTrailerKey(t.key);
    } catch (e) {
      console.error("Trailer error", e);
    }
  };

  // Detail modal
  const openDetail = async (movie) => {
    setSelectedMovie(movie);
    try {
      const r = await axios.get(`${BASE_URL}/movie/${movie.id}/similar?api_key=${API_KEY}`);
      setRelatedMovies(r.data.results || []);
    } catch (e) {
      setRelatedMovies([]);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setRelatedMovies([]);
  };

  // Watchlist
  const addToWatchlist = async (movie) => {
    if (!token) return alert("Login required");

    try {
      await axios.post(
        "/api/watchlist/add",
        {
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster_path,
          rating: movie.vote_average,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Added to watchlist");
    } catch (e) {
      alert("Failed to add");
    }
  };

  // HERO Banner component (same)
  const HeroBanner = ({ movies }) => {
    const [index, setIndex] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
      if (!movies.length) return;
      ref.current = setInterval(() => setIndex((i) => (i + 1) % movies.length), 5000);
      return () => clearInterval(ref.current);
    }, [movies]);

    const m = movies[index];
    if (!m) return null;

    return (
      <div
        className="hero-banner"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${IMG}${m.backdrop_path})`,
        }}
      >
        <div className="hero-inner">
          <div className="hero-info">
            <h2>{m.title}</h2>
            <p>{m.overview}</p>
            <div className="hero-btns">
              <button onClick={() => openTrailer(m.id)}>▶ Trailer</button>
              <button onClick={() => openDetail(m)}>ℹ More</button>
            </div>
          </div>

          <img className="hero-poster" src={`${IMG}${m.poster_path}`} />
        </div>
      </div>
    );
  };

  // Movie Row (reused)
  const MovieRow = ({ movies }) => {
    return (
      <div className="movie-row">
        {movies.map((m) => (
          <motion.div
            key={m.id}
            className="movie-card"
            whileHover={{ scale: 1.06 }}
            onClick={() => openDetail(m)}
          >
            <img src={`${IMG}${m.poster_path}`} />
            <div className="card-overlay">
              <p>{m.title}</p>
              <span>⭐ {m.vote_average}</span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // ---------- PROMPT HANDLER ----------
  // simple keyword-based genre detection from prompt
  const detectGenreFromPrompt = (text) => {
    const lowered = text.toLowerCase();
    for (const g of GENRES) {
      if (!g.id || !g.name) continue;
      if (lowered.includes(g.name.toLowerCase())) return g.id;
    }
    if (lowered.includes("sci") || lowered.includes("science")) return 878;
    if (lowered.includes("romance") || lowered.includes("romantic")) return 10749;
    if (lowered.includes("action") || lowered.includes("fight") || lowered.includes("adventure")) return 28;
    if (lowered.includes("comedy") || lowered.includes("funny")) return 35;
    return "";
  };

  // prompt submit: search TMDB + optional discover-by-genre if genre detected
  const handlePromptSubmit = async (e) => {
    e?.preventDefault();
    if (!promptText.trim()) return;
    setPromptLoading(true);
    setPromptResults([]);
    setPromptLabel(promptText);
    setSelectedPromptMovie(null);

    try {
      // A small delay to show AI thinking animation
      await new Promise((r) => setTimeout(r, 500));

      // 1) plain search by query
      const searchRes = await axios.get(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(promptText)}&page=1`
      );
      const searchMovies = searchRes.data.results || [];

      // 2) detect genre and also fetch discover results to broaden picks
      const detectedGenre = detectGenreFromPrompt(promptText);
      let discoverMovies = [];
      if (detectedGenre) {
        const disc = await axios.get(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${detectedGenre}&sort_by=popularity.desc&page=1`
        );
        discoverMovies = disc.data.results || [];
      }

      // 3) combine and dedupe
      const combined = [...searchMovies, ...discoverMovies];
      const uniqueMap = new Map();
      combined.forEach((m) => {
        if (!uniqueMap.has(m.id)) uniqueMap.set(m.id, m);
      });
      const combinedUnique = Array.from(uniqueMap.values());

      // 4) apply AI scoring (re-using existing function)
      const scored = applyAIScoring(combinedUnique);

      // 5) store prompt results
      setPromptResults(scored.slice(0, 30)); // cap to 30

      // small flair delay
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error("Prompt error", err);
    } finally {
      setPromptLoading(false);
    }
  };

  // fetch similar for a prompt movie (cached)
  const fetchSimilarForPrompt = async (movieId) => {
    if (similarForPrompt[movieId]) return; // cached
    try {
      const r = await axios.get(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&page=1`);
      setSimilarForPrompt((prev) => ({ ...prev, [movieId]: r.data.results || [] }));
    } catch (e) {
      setSimilarForPrompt((prev) => ({ ...prev, [movieId]: [] }));
    }
  };

  // choose a prompt result to show its similar movies (inline)
  const handleSelectPromptMovie = async (m) => {
    setSelectedPromptMovie(m);
    await fetchSimilarForPrompt(m.id);
    // also open detail if user wants by clicking the card (we keep both)
  };

  // initial / AI pick effect (unchanged from before)
  useEffect(() => {
    // optional: pre-load default hero + rows on mount
    (async () => {
      try {
        const hero = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        setHeroMovies(applyAIScoring(hero.data.results || []));

        const promises = BASE_CATEGORIES.map((c) =>
          axios.get(`${BASE_URL}${c.url}?api_key=${API_KEY}`).then((res) => ({
            key: c.key,
            title: c.title,
            movies: applyAIScoring(res.data.results || []),
          }))
        );
        const fetched = await Promise.all(promises);
        setRows(fetched);
        const all = fetched.flatMap((r) => r.movies);
        setTop10(all.slice(0, 10));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="recommend-page">
      {/* topbar */}
      <div className="recommend-topbar">
        <h1>AI Movie Recommendations</h1>

        <div className="controls">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {BASE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.title}
              </option>
            ))}
          </select>

          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select value={selectedMood} onChange={(e) => setSelectedMood(e.target.value)}>
            {MOODS.map((m) => (
              <option key={m.key} value={m.key}>
                Mood: {m.label}
              </option>
            ))}
          </select>

          <button className="ai-pick-btn" disabled={aiThinking} onClick={handleAIPick}>
            ✨ AI Pick
          </button>
        </div>
      </div>

      {/* PROMPT BOX (Hybrid Option C) */}
      <form className="ai-prompt-box" onSubmit={handlePromptSubmit}>
        <textarea
          placeholder='Write a prompt: e.g. "Sci-fi movies like Interstellar with mind-bending twists and emotional core"'
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
        <div className="prompt-actions">
          <button type="submit" className="prompt-btn" disabled={promptLoading}>
            🤖 AI Suggest
          </button>
          <button
            type="button"
            className="clear-btn"
            onClick={() => {
              setPromptText("");
              setPromptResults([]);
              setPromptLabel("");
              setSelectedPromptMovie(null);
            }}
          >
            Clear
          </button>
        </div>

        {promptLoading && (
          <div className="prompt-loading">
            <div className="ai-badge small">AI</div>
            <span>Thinking about your prompt…</span>
          </div>
        )}
      </form>

      {/* PROMPT RESULTS */}
      {promptLabel && (
        <div className="prompt-results">
          <h3>
            Results for: <em>"{promptLabel}"</em>
          </h3>

          <div className="prompt-grid">
            {promptResults.length === 0 && !promptLoading && (
              <p className="muted">No results found for this prompt.</p>
            )}

            {promptResults.map((m) => (
              <div key={m.id} className="prompt-card">
                <motion.div
                  className="prompt-poster"
                  whileHover={{ scale: 1.03 }}
                  onClick={() => openDetail(m)}
                >
                  <img src={`${IMG}${m.poster_path}`} alt={m.title} />
                  <div className="prompt-score">AI {m.aiScore?.toFixed(1)}</div>
                </motion.div>

                <div className="prompt-meta">
                  <p className="title">{m.title}</p><br />
                  <div className="prompt-meta-actions">
                    <button
                      onClick={() => {
                        handleSelectPromptMovie(m);
                      }}
                    >
                      Show Similar
                    </button>

                    <button onClick={() => addToWatchlist(m)}>+ Watchlist</button>
                  </div>
                </div>

                {/* inline similar row for this card (if loaded and selected) */}
                {selectedPromptMovie?.id === m.id && (
                  <div className="similar-inline">
                    <h4>Similar to {m.title}</h4>

                    <div className="similar-row">
                      {(similarForPrompt[m.id] || []).map((s) => (
                        <motion.div
                          key={s.id}
                          className="similar-card"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => openDetail(s)}
                        >
                          <img src={`${IMG}${s.poster_path}`} alt={s.title} />
                          <p>{s.title}</p>
                        </motion.div>
                      ))}
                      {(!similarForPrompt[m.id] || similarForPrompt[m.id].length === 0) && (
                        <p className="muted">No similar movies found.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The rest of the page: hero, rows, top10 (existing behavior) */}
      {!promptLabel && !hasPicked && !aiThinking && (
        <div className="ai-welcome">
          <p>Adjust filters & press <strong>AI Pick</strong> or type a prompt to get suggestions.</p>
        </div>
      )}

      {aiThinking && (
        <div className="ai-reveal">
          <div className="ai-badge">AI</div>
          <p className="ai-text">Analyzing preferences...</p>
          <div className="ai-loader"></div>
        </div>
      )}

      {!promptLabel && hasPicked && (
        <>
          <HeroBanner movies={heroMovies} />

          <div className="rows-wrapper">
            {rows.map((r) => (
              <div key={r.key}>
                <h3 className="row-title">{r.title}</h3>
                <MovieRow movies={r.movies} />
              </div>
            ))}

            <h3 className="top10-title">Top 10 For You</h3>
            <div className="top10-grid">
              {top10.map((m, i) => (
                <div className="top10-card" key={m.id}>
                  <div className="rank">{i + 1}</div>
                  <img src={`${IMG}${m.poster_path}`} />
                  <p>{m.title}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Trailer overlay */}
      {trailerKey && (
        <div className="trailer-overlay" onClick={() => setTrailerKey("")}>
          <div className="trailer-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-trailer" onClick={() => setTrailerKey("")}>
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <div className="trailer-overlay" onClick={closeModal}>
          <div className="movie-detail" onClick={(e) => e.stopPropagation()}>
            <button className="close-trailer" onClick={closeModal}>
              ✕
            </button>

            <div className="detail-body">
              <img src={`${IMG}${selectedMovie.poster_path}`} />
              <div>
                <h2>{selectedMovie.title}</h2>
                <p>{selectedMovie.overview}</p>
                <p>⭐ {selectedMovie.vote_average}</p>

                <div className="detail-actions">
                  <button className="cta-watch" onClick={() => openTrailer(selectedMovie.id)}>
                    ▶ Trailer
                  </button>

                  {token && (
                    <button className="cta-more" onClick={() => addToWatchlist(selectedMovie)}>
                      + Add to Watchlist
                    </button>
                  )}
                </div>

                <h4>Related</h4>
                <div className="related-row">
                  {relatedMovies.map((r) => (
                    <img
                      key={r.id}
                      src={`${IMG}${r.poster_path}`}
                      onClick={() => openDetail(r)}
                      alt={r.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

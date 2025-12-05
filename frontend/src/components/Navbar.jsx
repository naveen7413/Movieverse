import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiMenu } from "react-icons/fi";
import axios from "axios";
import "../styles/profile.css";

const Navbar = () => {
  const { token, logoutUser } = useContext(AuthContext);

  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [theme, setTheme] = useState("dark");

  const [openProfile, setOpenProfile] = useState(false);

  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#ff4d4d");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [watchlist, setWatchlist] = useState([]);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const TMDB_KEY = "4f274059f1ea723ba6ba81662cef48fc";

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // DARK MODE
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.body.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // LIVE SEARCH
  const searchMovie = async (value) => {
    setSearch(value);
    if (value.length < 2) return setResults([]);
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${value}`
    );
    const data = await res.json();
    setResults(data.results || []);
  };

  // ---------------- FETCH USER PROFILE ----------------
  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      const res = await axios.get("http://localhost:5000/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setEditName(res.data.name);
      setEditColor(res.data.profileColor);
      setWatchlist(res.data.watchlist || []);
    };
    fetchProfile();
  }, [token]);

  // ---------------- UPDATE BASIC INFO ----------------
  const updateProfile = async () => {
    await axios.put(
      "http://localhost:5000/api/profile/update",
      { name: editName, profileColor: editColor },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Profile Updated!");
  };

  // ---------------- UPDATE PASSWORD ----------------
  const updatePassword = async () => {
    await axios.put(
      "http://localhost:5000/api/profile/update-password",
      { oldPassword: oldPass, newPassword: newPass },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Password Updated!");
    setShowPasswordModal(false);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">MovieApp</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => searchMovie(e.target.value)}
          />
          {results.length > 0 && (
            <div className="search-results">
              {results.slice(0, 6).map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="result-item"
                  onClick={() => {
                    setSearch("");
                    setResults([]);
                  }}
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                        : "/placeholder.jpg"
                    }
                    alt="movie"
                  />
                  <p>{movie.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="nav-links">
          <Link to="/">Movies</Link>
          
          <Link to="/recommend">Recommend</Link>

          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {!token && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {token && (
            <div className="profile-wrapper">
              <div
                className="profile-icon"
                style={{ background: editColor }}
                onClick={() => setOpenMenu(!openMenu)}
              >
                {firstLetter}
              </div>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    className="profile-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {/* Open full profile panel */}
                    <p
                      className="menu-item"
                      onClick={() => {
                        setOpenProfile(true);
                        setOpenMenu(false);
                      }}
                    >
                      👤 Profile
                    </p>

                    <Link
                      to="/watchlist"
                      className="menu-item"
                      onClick={() => setOpenMenu(false)}
                    >
                      ⭐ Watchlist
                    </Link>

                    <p className="menu-item logout" onClick={logoutUser}>
                      🚪 Logout
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="mobile-menu-icon" onClick={() => setMobileMenu(true)}>
            <FiMenu />
          </div>
        </div>
      </nav>

      {/* =========================
          🔥 PROFILE PANEL ANIMATE PRESENCE
      =========================== */}
      <AnimatePresence>
        {openProfile && (
          <motion.div
            className="profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="profile-box"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              {!user ? (
                <h2 style={{ color: "white" }}>Loading...</h2>
              ) : (
                <>
                  <h2>Edit Profile</h2>

                  <label>Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />

                  <label>Profile Color</label>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                  />

                  <button onClick={updateProfile} className="save-btn">
                    Save Changes
                  </button>

                  <button
                    className="password-btn"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </button>

                  {/* ---------------- PASSWORD MODAL ---------------- */}
                  {showPasswordModal && (
                    <div className="modal-overlay">
                      <motion.div
                        className="password-modal"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <h3>Change Password</h3>

                        <label>Old Password</label>
                        <input
                          type="password"
                          value={oldPass}
                          onChange={(e) => setOldPass(e.target.value)}
                        />

                        <label>New Password</label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />

                        <button onClick={updatePassword} className="save-btn">
                          Update
                        </button>

                        <button
                          className="close-btn"
                          onClick={() => setShowPasswordModal(false)}
                        >
                          Close
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {/* ---------------- WATCHLIST ---------------- */}
                  <div className="watchlist-section">
                    <h3>Your Watchlist</h3>

                    <div className="watchlist-grid">
                      {watchlist.map((movie) => (
                        <motion.div
                          className="watch-item"
                          key={movie.movieId}
                          whileHover={{ scale: 1.05 }}
                        >
                          <img src={movie.poster} alt="" />
                          <div className="watch-info">
                            <h4>{movie.title}</h4>
                            <p>⭐ {movie.rating}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                className="cancel-btn"
                onClick={() => setOpenProfile(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

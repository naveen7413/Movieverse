import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import "../styles/profile.css";

const Profile = () => {
  const { token } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#ff4d4d");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [watchlist, setWatchlist] = useState([]);

  // ---------------- FETCH USER PROFILE ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get("http://localhost:5000/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setEditName(res.data.name);
      setEditColor(res.data.profileColor);
    };
    fetchProfile();

    const fetchWatchlist = async () => {
      const res = await axios.get("http://localhost:5000/api/watchlist/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist(res.data);
    };
    fetchWatchlist();
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

  if (!user) return <h2 style={{ color: "white" }}>Loading...</h2>;

  return (
    <motion.div
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ---------------- HEADER ---------------- */}
      <div className="profile-header">
        <div
          className="profile-circle"
          style={{ background: user.profileColor }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p className="joined">Member since {user.createdAt.slice(0, 10)}</p>
        </div>
      </div>

      {/* ---------------- EDIT SECTION ---------------- */}
      <div className="edit-section">
        <h3>Edit Profile</h3>

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
      </div>

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
    </motion.div>
  );
};

export default Profile;

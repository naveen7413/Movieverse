import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaTrash } from "react-icons/fa";
import "../styles/watchlist.css";

const Watchlist = () => {
  const { token } = useContext(AuthContext);
  const [list, setList] = useState([]);

  // Fetch watchlist
  const fetchList = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/watchlist/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList(res.data.watchlist || []);
    } catch (err) {
      console.log("Error fetching watchlist:", err);
    }
  };

  useEffect(() => {
    fetchList();
  }, [token]);

  // Remove movie from watchlist
  const removeFromWatchlist = async (movieId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/watchlist/remove/${movieId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setList((prev) => prev.filter((m) => m.movieId !== movieId));
    } catch (err) {
      console.log("Error removing movie:", err);
    }
  };

  return (
    <div className="watchlist-container">
      <h2>Your Watchlist</h2>

      {list.length === 0 ? (
        <p className="empty-watchlist">No movies in watchlist</p>
      ) : (
        <div className="watchlist-grid">
          {list.map((m) => (
            <div key={m.movieId} className="watch-card">
              <div className="watch-image-container">
                <img src={m.poster} alt={m.title} />
                <button
                  className="remove-icon"
                  onClick={() => removeFromWatchlist(m.movieId)}
                >
                  <FaTrash />
                </button>
              </div>
              <div className="watch-info">
                <p>{m.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;

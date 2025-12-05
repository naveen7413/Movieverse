// TrailerPopup.jsx
import { useEffect } from "react";
import "../styles/trailer.css";

const TrailerPopup = ({ src = "", onClose = () => {} }) => {
  useEffect(() => {
    if (src) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [src]);

  if (!src) return null;

  return (
    <div className="trailer-wrap" onClick={onClose}>
      <div className="trailer-box" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={src}
          title="trailer"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        <button className="trailer-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TrailerPopup;

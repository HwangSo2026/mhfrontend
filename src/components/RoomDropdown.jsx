import { useEffect, useRef, useState } from "react";
import "../styles/room-dropdown.css";

const RoomDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="dd-wrap" ref={wrapRef}>
      <button
        type="button"
        className="dd-btn"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value}</span>
        <span className="dd-arrow">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="dd-list">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`dd-item ${opt === value ? "is-active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomDropdown;
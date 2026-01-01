const TimeSection = ({ selectedTime, onSelect }) => {
  const times = [
    "08:00-09:00",
    "09:00-11:00",
    "11:00-13:00",
    "13:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
    "18:00-20:00",
    "20:00-21:00",
  ];

  return (
    <section className="time-section">
      {/* <h3 className="section-title">시간 선택</h3> */}

      <div className="time-grid">
        {times.map((t) => (
          <button
            key={t}
            className={`time-button ${selectedTime === t ? "selected" : ""}`}
            onClick={() => onSelect(t)}
          >
            <span className="time-text">{t}</span>
            {selectedTime === t && <span className="time-badge">선택</span>}
          </button>
        ))}
      </div>
    </section>
  );
};

export default TimeSection;

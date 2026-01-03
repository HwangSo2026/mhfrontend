const TimeSection = ({ selectedTimes, onChange }) => {
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

  const handleClick = (time) => {
    // 이미 선택된 시간 → 취소
    if (selectedTimes.includes(time)) {
      onChange(selectedTimes.filter((t) => t !== time));
      return;
    }

    // 최대 2개 제한
    if (selectedTimes.length >= 2) return;

    // 새 시간 추가
    onChange([...selectedTimes, time]);
  };

  return (
    <section className="time-section">
      <div className="time-grid">
        {times.map((t) => {
          const selected = selectedTimes.includes(t);

          return (
            <button
              key={t}
              className={`time-button ${selected ? "selected" : ""}`}
              onClick={() => handleClick(t)}
            >
              <span className="time-text">{t}</span>
              {selected && <span className="time-badge">선택</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default TimeSection;

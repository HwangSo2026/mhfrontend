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
    // 1) 토글 해제
    if (selectedTimes.includes(time)) {
      onChange(selectedTimes.filter((t) => t !== time));
      return;
    }

    // 2) 2개 미만이면 추가
    if (selectedTimes.length < 2) {
      onChange([...selectedTimes, time]);
      return;
    }

    // 3) 이미 2개면 FIFO: 오래된 1개 제거 + 새거 추가
    onChange([...selectedTimes.slice(1), time]);
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
              type="button"
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
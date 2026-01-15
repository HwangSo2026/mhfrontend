import "../styles/room-section.css";

const RoomSection = ({
  rooms,
  selectedRoom,
  onSelect,
  heldMap = {}, // { "1": true, "2": false ... }
  loading = false,
}) => {
  return (
    <div className="room-list">
      {rooms.map((label) => {
        const roomNo = String(label).match(/\d+/)?.[0]; // "회의실 3" -> "3"
        const held = !!heldMap[roomNo];
        const selected = selectedRoom === label;

        // ✅ 선점중이면 비활성 (내가 이미 선택한 건 표시 위해 예외)
        const disabled = loading || (held && !selected);

        return (
          <button
            key={label}
            className={`room-card ${selected ? "selected" : ""} ${
              disabled ? "disabled" : ""
            }`}
            onClick={() => !disabled && onSelect(label)}
            disabled={disabled}
            type="button"
          >
            <span>{label}</span>

            {held && !selected && <span className="room-badge">예약 중</span>}
            {selected && <span className="room-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
};

export default RoomSection;

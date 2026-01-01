import "../styles/room-section.css";

const RoomSection = ({ selectedRoom, onSelect }) => {
  const rooms = ["회의실 1", "회의실 2", "회의실 3", "회의실 4", "회의실 5"];

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <button
          key={room}
          className={`room-card ${selectedRoom === room ? "selected" : ""}`}
          onClick={() => onSelect(room)}
        >
          <span>{room}</span>

          {selectedRoom === room && <span className="room-check">✓</span>}
        </button>
      ))}
    </div>
  );
};

export default RoomSection;

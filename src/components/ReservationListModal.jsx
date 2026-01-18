import Modal from "./Modal";
import "../styles/reservation.css";

const ReservationListModal = ({ reservations = [], onClose, onPick }) => {
  return (
    <Modal type="center" onClose={onClose}>
      <div className="form-header">
        <h2 className="form-title">예약 내역</h2>
      </div>

      <div style={{ marginTop: 10 }} />

      {reservations.length === 0 ? (
        <p style={{ color: "#6b7280" }}>예약 내역이 없습니다.</p>
      ) : (
        <div className="reservation-list">
          {reservations.map((r) => (
            <button
              key={r.id}
              type="button"
              className="reservation-card"
              onClick={() => onPick?.(r)}
            >
              <div className="reservation-card-top">
                <span className="reservation-room">{r.room}</span>
                <span className="reservation-time">{r.time}</span>
              </div>
              <div className="reservation-card-bottom">
                <span>📅 {r.date}</span>
                <span>{r.classType} · {r.count}명</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12 }} />
    </Modal>
  );
};

export default ReservationListModal;
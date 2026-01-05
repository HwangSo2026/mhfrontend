import Modal from "./Modal";
import "../styles/confirm-modal.css";

const ConfirmModal = ({ selections = [], onNext, onClose }) => {
  return (
    <Modal type="bottom" onClose={onClose}>
      <div className="confirm-header">
        <h2 className="confirm-title">예약 확인</h2>
      </div>

      {selections.map((s, idx) => (
        <div key={`${s.time}-${idx}`} className="confirm-box">
          <div style={{ fontWeight: 600 }}>
            {selections.length === 2 ? `${idx + 1}번째 예약` : "예약"}
          </div>
          <div>{s.time}</div>
          <div style={{ marginTop: 6 }}>{s.room}</div>
        </div>
      ))}

      <button className="confirm-next" onClick={onNext}>
        다음 단계
      </button>
    </Modal>
  );
};

export default ConfirmModal;
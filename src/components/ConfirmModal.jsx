import Modal from "./Modal";
import "../styles/confirm-modal.css";

const ConfirmModal = ({ times = [], room, onNext, onClose }) => {
  return (
    <Modal type="bottom" onClose={onClose}>
      {/* 헤더 */}
      <div className="confirm-header">
        <h2 className="confirm-title">예약 확인</h2>
      </div>

      {/* 선택된 시간들 */}
      {times.map((t) => (
        <div key={t} className="confirm-box">
          {t}
        </div>
      ))}

      {/* 회의실 */}
      <div className="confirm-box">{room}</div>

      <button className="confirm-next" onClick={onNext}>
        다음 단계
      </button>
    </Modal>
  );
};

export default ConfirmModal;

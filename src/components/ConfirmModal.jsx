import Modal from "./Modal";
import "../styles/confirm-modal.css";

const ConfirmModal = ({ selections, onClose, onNext }) => {
  return (
    <Modal type="bottom" onClose={onClose}>
      <h2 className="confirm-title">예약 내용 확인</h2>

      {selections.map((s, idx) => (
        <div key={idx} className="confirm-box">
          <div>{s.time}</div>
          <div>{s.room}</div>
        </div>
      ))}

      <button className="confirm-next" onClick={onNext}>
        다음 단계
      </button>
    </Modal>
  );
};

export default ConfirmModal;

import Modal from "./Modal";
import "../styles/confirm-modal.css";

const ConfirmModal = ({ time, room, onNext, onClose }) => {
  return (
    <Modal onClose={onClose}>
      <h2 className="modal-title">예약 확인</h2>

      <div className="confirm-box">{time}</div>
      <div className="confirm-box">{room}</div>

      <button className="confirm-next" onClick={onNext}>
        다음 단계
      </button>
    </Modal>
  );
};

export default ConfirmModal;

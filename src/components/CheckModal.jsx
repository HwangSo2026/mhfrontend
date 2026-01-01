import Modal from "./Modal";

const CheckModal = ({ onClose }) => {
  return (
    <Modal onClose={onClose}>
      <h3>예약 내역 조회</h3>

      <input placeholder="예약자" />
      <input placeholder="임시 비밀번호" />

      <button>예약 조회</button>
      <button className="danger">예약 취소</button>
    </Modal>
  );
};

export default CheckModal;

import { useState } from "react";
import Modal from "./Modal";

const FormModal = ({ time, room, onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const [count, setCount] = useState(4);

  return (
    <Modal onClose={onClose}>
      <h3>예약 정보 입력</h3>

      <input
        placeholder="예약자"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        인원 수
        <button onClick={() => setCount(Math.max(1, count - 1))}>-</button>
        {count}
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>

      <button onClick={onSubmit}>예약 완료</button>
    </Modal>
  );
};

export default FormModal;

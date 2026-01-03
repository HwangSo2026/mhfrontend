import { useState } from "react";
import Modal from "./Modal";
import "../styles/form-modal.css";

const FormModal = ({ onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const [count, setCount] = useState(4);
  const [generation, setGeneration] = useState("3기");
  const [classType, setClassType] = useState(null);
  const [pin, setPin] = useState(["", "", "", ""]);

  const classes = ["임베디드", "클라우드", "웹/앱", "스마트팩토리", "IT/보안"];

  return (
    <Modal type="center" onClose={onClose}>
      {/* 헤더 */}
      <div className="form-header">
        <h2 className="form-title">예약 정보 입력</h2>
      </div>

      {/* 예약자 */}
      <label className="form-label">예약자</label>
      <input
        className="form-input yellow"
        placeholder="예약자 명을 입력해 주세요."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* 인원 수 */}
      {/* <div className="form-row center">
        <span className="row-label">인원 수</span>
        <div className="counter">
          <button onClick={() => setCount(Math.max(1, count - 1))}>−</button>
          <span>{count}명</span>
          <button onClick={() => setCount(count + 1)}>＋</button>
        </div>
      </div> */}
      <div className="people-group">
        <span className="row-label">인원 수</span>
        <div className="counter">
          <button onClick={() => setCount(Math.max(1, count - 1))}>−</button>
          <span>{count}명</span>
          <button onClick={() => setCount(count + 1)}>＋</button>
        </div>
      </div>

      {/* 해당 반 */}
      <label className="form-label">해당 반</label>
      <div className="class-group">
        {classes.map((c) => (
          <button
            key={c}
            className={`class-btn ${classType === c ? "selected" : ""}`}
            onClick={() => setClassType(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 임시 비밀번호 */}
      {/* 중앙 정렬하고 싶으면 center 주석 해제해서 쓰면 됨(CSS에서도) */}
      {/* <label className="form-label center">예약 조회용 임시 비밀번호</label> */}
      <label className="form-label ">예약 조회용 임시 비밀번호</label>
      <div className="pin-row">
        {pin.map((v, i) => (
          <input
            key={i}
            className="pin-input yellow"
            maxLength={1}
            value={v}
            onChange={(e) => {
              const next = [...pin];
              next[i] = e.target.value;
              setPin(next);
            }}
          />
        ))}
      </div>
      <p className="hint">임시 비밀번호 4자리를 입력해 주세요.</p>

      {/* 하단 구분선 */}
      <div className="form-divider" />

      {/* 제출 */}
      <button className="form-submit" onClick={onSubmit}>
        예약 완료
      </button>
    </Modal>
  );
};

export default FormModal;

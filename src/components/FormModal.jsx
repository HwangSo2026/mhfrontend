import { useRef, useState } from "react";
import Modal from "./Modal";
import "../styles/form-modal.css";

const FormModal = ({ onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const [count, setCount] = useState(4);
  const [classType, setClassType] = useState(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = useRef([]);

  const classes = ["임베디드", "클라우드", "웹/앱", "스마트팩토리", "IT/보안"];

  const handlePinChange = (idx, value) => {
    // 숫자만 남기기
    const digit = value.replace(/\D/g, "").slice(-1); // 마지막 1자리만

    const next = [...pin];
    next[idx] = digit;
    setPin(next);

    // 한 자리 입력되면 다음 칸으로
    if (digit && idx < 3) {
      pinRefs.current[idx + 1]?.focus();
    }
  };

  const handlePinKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      // 현재 칸에 값이 있으면 지우기만
      if (pin[idx]) {
        const next = [...pin];
        next[idx] = "";
        setPin(next);
        return;
      }
      // 현재 칸이 비어있으면 이전 칸으로 이동 + 그 칸 지우기
      if (idx > 0) {
        pinRefs.current[idx - 1]?.focus();
        const next = [...pin];
        next[idx - 1] = "";
        setPin(next);
      }
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 4);
    if (!text) return;

    const next = ["", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setPin(next);

    // 마지막 채워진 곳으로 포커스
    const focusIndex = Math.min(text.length, 4) - 1;
    pinRefs.current[focusIndex]?.focus();
  };

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
      <div className="people-group">
        <span className="row-label">인원 수</span>
        <div className="counter">
          <button
            type="button"
            onClick={() => setCount(Math.max(2, count - 1))}
            disabled={count <= 2}
          >
            −
          </button>

          <span>{count}명</span>

          <button type="button" onClick={() => setCount(count + 1)}>
            ＋
          </button>
        </div>
      </div>

      {/* 해당 반 */}
      <label className="form-label">해당 반</label>
      <div className="class-group">
        {classes.map((c) => (
          <button
            type="button"
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
      <div className="pin-row" onPaste={handlePinPaste}>
        {pin.map((v, i) => (
          <input
            key={i}
            ref={(el) => (pinRefs.current[i] = el)}
            className="pin-input yellow"
            value={v}
            onChange={(e) => handlePinChange(i, e.target.value)}
            onKeyDown={(e) => handlePinKeyDown(i, e)}
            maxLength={1}

            // ✅ 모바일 숫자 키패드
            inputMode="numeric"
            pattern="[0-9]*"

            // ✅ 실제 값은 저장하지만 화면은 마스킹(*)
            type="password"

            // ✅ iOS 자동완성/자동수정 방지(가끔 이상해짐)
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
          />
        ))}
      </div>
      {/* <p className="hint">임시 비밀번호 4자리를 입력해 주세요.</p> */}

      {/* 하단 구분선 */}
      <div className="form-divider" />

      {/* 제출 */}
      <button type="button" className="form-submit" onClick={onSubmit}>
        예약 완료
      </button>
    </Modal>
  );
};

export default FormModal;

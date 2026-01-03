import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import "../styles/check-modal.css";

const CheckModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    setName("");
    setPin(["", "", "", ""]);
    setActiveIndex(0);
    setTimeout(() => inputsRef.current?.[0]?.focus(), 0);
  }, []);

  const handlePinKeyDown = (idx, e) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();

    const next = [...pin];

    // 현재 칸에 값이 있으면 현재만 지우고 이전으로 이동
    if (next[idx]) {
      next[idx] = "";
      setPin(next);

      const prev = Math.max(idx - 1, 0);
      setActiveIndex(prev);
      inputsRef.current[prev]?.focus();
      return;
    }

    // 현재 칸이 비어있으면 이전 칸 지우고 이동
    if (idx === 0) return;
    const prev = idx - 1;
    next[prev] = "";
    setPin(next);

    setActiveIndex(prev);
    inputsRef.current[prev]?.focus();
  };

  const handlePinChange = (idx, value) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...pin];
    next[idx] = v;
    setPin(next);

    if (v && idx < 3) {
      setActiveIndex(idx + 1);
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const canSubmit = name.trim().length > 0 && pin.every((x) => x !== "");

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ name: name.trim(), password: pin.join("") });
  };

  return (
    <Modal onClose={onClose}>
      <div style={{marginTop:"16px"}}></div>
      <div className="form-header">
        <span className="form-title">예약 내역 조회</span>
        <div style={{marginTop:"16px"}}></div>
      </div>
      
      <label className="form-label">예약자</label>
      <input
          className="form-input yellow"
          placeholder="예약자 명을 입력해 주세요."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      {/* PIN */}
      <label className="form-label" style={{marginTop:"32px"}}>예약 조회용 임시 비밀번호</label>
      <div style={{marginTop:"8px"}}></div>
      <div className="rlm-pinRow pin-row">
        {pin.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            className="rlm-pinInput pin-input yellow"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            onFocus={() => setActiveIndex(idx)}
            value={activeIndex === idx ? digit : digit ? "*" : ""}
            onChange={(e) => handlePinChange(idx, e.target.value)}
            onKeyDown={(e) => handlePinKeyDown(idx, e)}
          />
        ))}
      </div>

      <div className="공백">

      </div>

      <button
        className="rlm-submit check-submit"
        disabled={!canSubmit}
        onClick={handleSubmit}
        type="button"
      >
        예약 조회
      </button>

      <div style={{marginTop:"16px"}}></div>

    </Modal>
  );
};

export default CheckModal;
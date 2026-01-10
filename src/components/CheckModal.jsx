import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import ReservationDetailModal from "./ReservationDetailModal"; // ✅ 추가
import "../styles/check-modal.css";

const CheckModal = ({ onClose, onFound }) => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputsRef = useRef([]);

  // ✅ 조회 성공 시 보여줄 예약 데이터(임시)
  const [detailOpen, setDetailOpen] = useState(false);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    setName("");
    setPin(["", "", "", ""]);
    setActiveIndex(0);
    // setTimeout(() => inputsRef.current?.[0]?.focus(), 0); 포커싱 삭제
  }, []);

  const handlePinKeyDown = (idx, e) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();

    const next = [...pin];

    if (next[idx]) {
      next[idx] = "";
      setPin(next);

      const prev = Math.max(idx - 1, 0);
      setActiveIndex(prev);
      inputsRef.current[prev]?.focus();
      return;
    }

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

    const payload = { name: name.trim(), password: pin.join("") };

    // ✅ 지금은 백엔드 없으니까 더미 리스트로 테스트
    const mockList = [
      {
        id: 1,
        date: "2026-01-05",
        time: "09:00-11:00",
        slot: "part2",
        room: "회의실 3",
        name: payload.name,
        count: 4,
        classType: "웹/앱",
        pin: payload.password,
      },
      {
        id: 2,
        date: "2026-01-05",
        time: "14:00-16:00",
        slot: "part5",
        room: "회의실 2",
        name: payload.name,
        count: 3,
        classType: "클라우드",
        pin: payload.password,
      },
    ];

    // ✅ 여기 한 줄이 Home으로 결과 넘기는 "호출"
    onFound?.(mockList);
  };

  // ✅ 조회 후에는 CheckModal 대신 상세 모달을 렌더링
  if (detailOpen && reservation) {
    return (
      <ReservationDetailModal
        reservation={reservation}
        onClose={onClose} // 나가기 누르면 전체 닫기
        onUpdate={(updated) => {
          // ✅ 수정 완료 눌렀을 때: 지금은 프론트에서만 반영
          console.log("updated:", updated);
          setReservation(updated);   // 화면 갱신
          // setDetailOpen(false);   // 수정 후 다시 조회 화면으로 보내고 싶으면 해제
        }}
      />
    );
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ marginTop: "16px" }} />
      <div className="form-header">
        <span className="form-title">예약 내역 조회</span>
        <div style={{ marginTop: "16px" }} />
      </div>

      <label className="form-label2">예약자</label>
      <input
        className="check-yellow2"
        placeholder="예약자 명을 입력해 주세요."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="form-label2" style={{ marginTop: "32px" }}>
        예약 조회용 임시 비밀번호
      </label>
      <div style={{ marginTop: "8px" }} />

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

      <div className="공백" />

      <button
        className="rlm-submit check-submit"
        disabled={!canSubmit}
        onClick={handleSubmit}
        type="button"
      >
        예약 조회
      </button>

      <div style={{ marginTop: "16px" }} />
    </Modal>
  );
};

export default CheckModal;
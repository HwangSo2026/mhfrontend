//  CheckModal.jsx
// 역할:
// - 예약 내역 조회 전용 모달
// - 예약자 이름 + 4자리 비밀번호로 조회
// - 사용자가 예약한 "모든 타임"을 한 화면에 표시
// - 예약 변경은 불가, 전체 예약 취소만 가능
//
// 화면 흐름:
// SEARCH  → 예약자 / 비밀번호 입력
// DETAIL  → 예약 상세 조회 (여러 타임 표시) + 취소 버튼
// CONFIRM → 예약 취소 확인
// DONE    → 예약 취소 완료 안내
// ERROR   → 조회 실패 안내   // [추가]

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import ReservationDetailModal from "./ReservationDetailModal"; // ✅ 추가
import "../styles/check-modal.css";
import { searchReservation } from "../api/reservationApi";

const CheckModal = ({ onClose, onDelete }) => {
  /* ======================================================
   * 1. SEARCH 단계 상태 (예약자 이름 / 비밀번호 입력)
   * ====================================================== */
  const [name, setName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputsRef = useRef([]);

  /* ======================================================
   * 2. 화면 단계 상태
   * SEARCH | DETAIL | CONFIRM | DONE | ERROR
   * ====================================================== */
  const [step, setStep] = useState("SEARCH");

  /* ======================================================
   * 3. 조회된 예약들 (배열)
   * ====================================================== */
  const [selectedReservations, setSelectedReservations] = useState([]);

  /* ======================================================
   * 3-1. 오류 메시지 상태
   * ====================================================== */
  const [errorMessage, setErrorMessage] = useState(""); // [추가]

  /* ======================================================
   * 4. slot → time 문자열 변환
   * ====================================================== */
  const SLOT_TO_TIME = {
    part1: "08:00-09:00",
    part2: "09:00-11:00",
    part3: "11:00-13:00",
    part4: "13:00-14:00",
    part5: "14:00-16:00",
    part6: "16:00-18:00",
    part7: "18:00-20:00",
    part8: "20:00-21:00",
  };

  /* ======================================================
   * 5. 모달 열릴 때 초기화
   * ====================================================== */
  useEffect(() => {
    setName("");
    setPin(["", "", "", ""]);
    setActiveIndex(0);
    setStep("SEARCH");
    setSelectedReservations([]);
    setErrorMessage(""); // [추가]

    setTimeout(() => inputsRef.current?.[0]?.focus(), 0);
  }, []);

  /* ======================================================
   * 6. PIN 입력 UX - 백스페이스 처리
   * ====================================================== */
  const handlePinKeyDown = (idx, e) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();

    const next = [...pin];

    if (next[idx]) {
      next[idx] = "";
      setPin(next);
      setActiveIndex(Math.max(idx - 1, 0));
      inputsRef.current[Math.max(idx - 1, 0)]?.focus();
      return;
    }

    if (idx === 0) return;
    next[idx - 1] = "";
    setPin(next);
    setActiveIndex(idx - 1);
    inputsRef.current[idx - 1]?.focus();
  };

  /* ======================================================
   * 7. PIN 입력 처리
   * ====================================================== */
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

  /* ======================================================
   * 8. 조회 버튼 활성 조건
   * ====================================================== */
  const canSubmit = name.trim().length > 0 && pin.every(Boolean);

  /* ======================================================
   * 9. 예약 조회 실행
   * ====================================================== */
  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const date = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const slots = Object.keys(SLOT_TO_TIME);

      const all = await Promise.all(
        slots.map((slot) =>
          searchReservation({
            date,
            slot,
            name,
            password: pin.join(""),
          })
        )
      );

      const matched = all
        .flat()
        .filter((r) => r.reservation?.name === name.trim());

      // 조회 결과 없음 → ERROR 단계로 이동
      if (matched.length === 0) {
        setErrorMessage(
          "예약 내역을 찾을 수 없어요.\n이름 또는 비밀번호를 다시 확인해 주세요."
        ); // [추가]
        setStep("ERROR"); // [추가]
        return;
      }

      const mapped = matched.map((r) => ({
        date,
        slot: r.slot,
        roomKey: r.room,
        time: SLOT_TO_TIME[r.slot],
        room: `회의실 ${r.room}`,
        name: r.reservation.name,
        course: r.reservation.course,
        headcount: r.reservation.headcount,
        password: pin.join(""),
      }));

      setSelectedReservations(mapped);
      setStep("DETAIL");
    } catch (e) {
      console.error(e);

      // 예상치 못한 에러도 ERROR 단계로 통합
      setErrorMessage(
        "예약 내역을 조회할 수 없어요.\n입력한 정보를 다시 확인해 주세요."
      ); // [추가]
      setStep("ERROR"); // [추가]
    }
  };

  /* ======================================================
   * 10. DETAIL 기준 데이터
   * ====================================================== */
  const base = selectedReservations[0];

  return (
    <Modal onClose={onClose}>
      {/* ================= SEARCH ================= */}
      {step === "SEARCH" && (
        <>
          <div className="form-header">
            <span className="form-title">예약 내역 조회</span>
          </div>

          <label className="form-label">예약자</label>
          <input
            className="form-input yellow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예약자 명을 입력해 주세요."
          />

          <label className="form-label" style={{ marginTop: 32 }}>
            예약 조회용 임시 비밀번호
          </label>

          <div className="pin-row">
            {pin.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                className="pin-input yellow"
                value={activeIndex === i ? d : d ? "*" : ""}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                onFocus={() => setActiveIndex(i)}
              />
            ))}
          </div>

          <button
            className="check-submit"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            예약 조회
          </button>
        </>
      )}

      {/* ================= DETAIL ================= */}
      {step === "DETAIL" && base && (
        <>
          <div className="check-header">
            <h2 className="check-title">예약 내역 조회</h2>
          </div>

          {selectedReservations.map((r, idx) => (
            <div key={idx} className="check-summary">
              {r.time} · {r.room}
            </div>
          ))}

          <label className="check-label">예약자</label>
          <input className="check-input" value={base.name} disabled />

          <label className="check-label">해당 반</label>
          <div className="readonly">{base.course}</div>

          <label className="check-label">인원 수</label>
          <div className="readonly">{base.headcount}명</div>

          <p className="check-notice">
            변경을 원하실 경우 예약을 취소한 뒤 다시 예약해주세요.
          </p>

          <button
            className="check-action red"
            onClick={() => setStep("CONFIRM")}
          >
            예약 취소
          </button>
        </>
      )}

      {/* ================= CONFIRM ================= */}
      {step === "CONFIRM" && (
        <>
          <h3 style={{ textAlign: "center" }}>예약을 취소할까요?</h3>

          <p style={{ textAlign: "center", margin: "16px 0" }}>
            취소 시 예약을 되돌릴 수 없습니다.
            <br />
            정말 취소하시겠습니까?
          </p>

          <div className="check-action-row">
            <button
              className="check-action yellow"
              onClick={() => setStep("DETAIL")}
            >
              아니오
            </button>

            <button
              className="check-action red"
              onClick={async () => {
                try {
                  await Promise.all(
                    selectedReservations.map((r) => onDelete(r))
                  );
                  setStep("DONE");
                } catch {
                  setErrorMessage("예약 취소에 실패했어요."); // [추가]
                  setStep("ERROR"); // [추가]
                }
              }}
            >
              예
            </button>
          </div>
        </>
      )}

      {/* ================= DONE ================= */}
      {step === "DONE" && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <h2>예약이 취소되었습니다</h2>
          <p style={{ color: "#6b7280", margin: "16px 0" }}>
            예약이 정상적으로 취소되었어요.
          </p>

          <button className="check-submit" onClick={onClose}>
            확인
          </button>
        </div>
      )}

      {/* ================= ERROR ================= */}
      {step === "ERROR" && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <h3>예약 내역 조회</h3>

          <p
            style={{
              margin: "16px 0",
              whiteSpace: "pre-line",
              color: "#374151",
            }}
          >
            {errorMessage}
          </p>

          <button className="check-submit" onClick={() => setStep("SEARCH")}>
            확인
          </button>
        </div>
      )}
    </Modal>
  );
};

export default CheckModal;

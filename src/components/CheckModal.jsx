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
import ReservationListModal from "./ReservationListModal";
import "../styles/check-modal.css";

import { searchReservation, adminLogin } from "../api/reservationApi"; // 관리자용

const CheckModal = ({ onClose, onDelete, onAdmin }) => {
  /* ======================================================
   *  CheckModal -> List Modal 쓰기
   * ====================================================== */
  const [picked, setPicked] = useState(null);

  const goBack = () => {
    if (step === "DETAIL") {
      setPicked(null);
      setStep("LIST");
      return;
    }
    if (step === "CONFIRM") {
      setStep("DETAIL");
      return;
    }
    if (step === "ERROR") {
      setStep("SEARCH");
      return;
    }
    if (step === "DONE") {
      onClose?.(); // 또는 setStep("SEARCH")
      return;
    }
  };

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
    setPicked(null); // picked 고른 방도 초기화

    // setTimeout(() => inputsRef.current?.[0]?.focus(), 0);
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
      // inputsRef.current[Math.max(idx - 1, 0)]?.focus();
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

    const trimmedName = name.trim();
    const pass = pin.join("");

    // ✅ 1) 관리자 로그인 먼저 시도 + 로그
    try {
      const result = await adminLogin({ name: trimmedName, password: pass });

      if (result?.role?.toLowerCase() === "admin") {
        onClose?.();
        onAdmin?.(result.token); // ✅ 토큰 넘기기 (권장)
        return; // ✅ 여기서 끝
      }
    } catch (e) {
      // 실패하면 그냥 사용자 조회로 넘어감
    }

    // ✅ 2) 여기부터 기존 "사용자 예약 조회"
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
            name: trimmedName,
            password: pass,
          }),
        ),
      );

      const matched = all
        .flat()
        .filter((r) => r.reservation?.name === trimmedName);

      if (matched.length === 0) {
        setErrorMessage(
          "예약 내역을 찾을 수 없어요.\n이름 또는 비밀번호를 다시 확인해 주세요.",
        );
        setStep("ERROR");
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
        password: pass,
      }));

      setSelectedReservations(mapped);
      setStep("LIST");
    } catch (e) {
      console.error(e);
      setErrorMessage(
        "예약 내역을 조회할 수 없어요.\n입력한 정보를 다시 확인해 주세요.",
      );
      setStep("ERROR");
    }
  };

  /* ======================================================
   * 10. DETAIL 기준 데이터 : 전체 -> 1개만 고르고 변경
   * ====================================================== */
  const base = picked ?? null;

  useEffect(() => {
    if (step === "DETAIL" && !picked) setStep("LIST");
  }, [step, picked]);

  /* ======================================================
   * LIST 단계면 CheckModal의 Modal을 쓰지 않고,
   * ReservationListModal이 가진 Modal을 그대로 사용
   * ====================================================== */
  if (step === "LIST") {
    const listItems = selectedReservations.map((r) => ({
      id: `${r.date}-${r.slot}-${r.roomKey}`, // 유니크 키
      room: r.room, // "회의실 3"
      time: r.time, // "09:00-11:00"
      date: r.date, // "2026-01-17"
      classType: r.course, // "클라우드" 등
      count: r.headcount, // 인원수
      // 필요하면 원본도 같이
      _raw: r,
    }));

    return (
      <ReservationListModal
        reservations={listItems}
        onClose={() => {
          setPicked(null); // "나가기" 누르면 다시 조회 화면으로 (골랐던거 null Set)
          setStep("SEARCH");
        }}
        onPick={(item) => {
          setPicked(item._raw); // 원본 예약 저장
          setStep("DETAIL"); // 여기서 디테일 화면으로 가도 되고
        }}
      />
    );
  }

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
                // ✅ 모바일 숫자패드 유도
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                enterKeyHint={i === pin.length - 1 ? "done" : "next"}
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
          <div className="form-header">
            <h2 className="check-title">예약 내역 조회</h2>
          </div>

          {/* 상단 예약 정보 (메타 칩) */}
          {(base?.date || base?.time || base?.room) && (
            <div className="meta-chips">
              {base?.date && (
                <div className="meta-chip2">
                  <span className="meta-ico">📅</span>
                  <span className="meta-txt">{base.date}</span>
                </div>
              )}

              <div className="meta-chips-div">
                {base?.time && (
                  <div className="meta-chip">
                    <span className="meta-ico">⏰</span>
                    <span className="meta-txt">{base.time}</span>
                  </div>
                )}
                {base?.room && (
                  <div className="meta-chip">
                    <span className="meta-ico">🏢</span>
                    <span className="meta-txt">{base.room}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <label className="check-label">예약자</label>
          <div className="check-input-div">
            <input className="check-input" value={base.name} disabled />
          </div>

          <label className="check-label">해당 반</label>
          <div className="check-input-div">
            <div className="readonly">{base.course}</div>
          </div>

          <label className="check-label">인원 수</label>
          <div className="check-input-div">
            <div className="readonly">{base.headcount}명</div>
          </div>

          <p className="check-notice">
            변경을 원하실 경우 예약을 취소한 뒤 다시 예약해주세요.
          </p>

          <div className="checkModal-btn-div">
            <button type="button" className="check-action gray" onClick={goBack}>
              뒤로 가기
            </button>

            <button
              className="check-action red"
              onClick={() => setStep("CONFIRM")}
            >
              예약 취소
            </button>
          </div>
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
                  await onDelete(base);

                  // ✅ next를 직접 만들어서 길이로 분기
                  const next = selectedReservations.filter(
                    (r) =>
                      !(
                        r.date === base.date &&
                        r.slot === base.slot &&
                        r.roomKey === base.roomKey
                      ),
                  );

                  setSelectedReservations(next);
                  setPicked(null);

                  setStep(next.length > 0 ? "LIST" : "DONE");
                } catch (e) {
                  console.error(e);
                  setErrorMessage("예약 취소에 실패했어요.");
                  setStep("ERROR");
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

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import "../styles/form-modal.css";
import "../styles/reservation.css";

const ReservationDetailModal = ({
  reservation,
  onClose,
  onUpdate,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [count, setCount] = useState(4);
  const [classType, setClassType] = useState(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = useRef([]);

  // ✅ 추가
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const closeTimerRef = useRef(null);

  const classes = ["임베디드", "클라우드", "웹/앱", "스마트팩토리", "IT/보안"];

  const hydrateFromReservation = (r) => {
    if (!r) return;

    setName(r.name ?? "");
    setCount(Number(r.count ?? 4));
    setClassType(r.classType ?? null);

    const rawPin = String(r.pin ?? r.password ?? "")
      .replace(/\D/g, "")
      .slice(0, 4);

    setPin([
      rawPin[0] ?? "",
      rawPin[1] ?? "",
      rawPin[2] ?? "",
      rawPin[3] ?? "",
    ]);
  };

  useEffect(() => {
    hydrateFromReservation(reservation);
  }, [reservation]);

  // ✅ 언마운트/닫기 전에 타이머 정리
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handlePinChange = (idx, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[idx] = digit;
    setPin(next);

    if (digit && idx < 3) pinRefs.current[idx + 1]?.focus();
  };

  const handlePinKeyDown = (idx, e) => {
    if (e.key !== "Backspace") return;

    if (pin[idx]) {
      const next = [...pin];
      next[idx] = "";
      setPin(next);
      return;
    }

    if (idx > 0) {
      pinRefs.current[idx - 1]?.focus();
      const next = [...pin];
      next[idx - 1] = "";
      setPin(next);
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();

    const text = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!text) return;

    const next = ["", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setPin(next);

    const focusIndex = Math.min(text.length, 4) - 1;
    pinRefs.current[focusIndex]?.focus();
  };

  const canSubmit =
    name.trim().length > 0 && !!classType && pin.every((x) => x !== "");

  // ✅ 수정하기(저장) + 성공 토스트 띄우고 자동 닫기
  const handleSave = async () => {
    if (!canSubmit || isSaving) return;

    const payload = {
      ...reservation,
      name: name.trim(),
      count,
      classType,
      pin: pin.join(""),
    };

    try {
      setIsSaving(true);
      await onUpdate?.(payload);

      // ✅ "저장되었습니다" 보여주기
      setSavedToast(true);

      // ✅ 1.2초 뒤 자동 닫기 (원하면 1500으로 바꿔도 됨)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        onClose?.();
      }, 1200);
    } catch (e) {
      alert("수정에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ 예약 취소
  const handleCancelReservation = async () => {
    if (isSaving) return;

    const ok = window.confirm("정말 예약을 취소할까요? (되돌릴 수 없어요)");
    if (!ok) return;

    await onCancel?.({
      ...reservation,
      name: name.trim(),
      count,
      classType,
      pin: pin.join(""),
    });

    onClose?.();
  };

  return (
    <Modal type="center" onClose={onClose}>
      {/* ✅ 저장 토스트 (모달 위에 살짝 뜨는 느낌) */}
      {savedToast && <div className="toast-success">저장되었습니다.</div>}

      {/* 헤더 */}
      <div className="form-header">
        <h2 className="form-title">예약 내역</h2>
      </div>

      {/* 상단 예약 정보 */}
      {(reservation?.date || reservation?.time || reservation?.room) && (
        <div className="meta-chips">
          {reservation?.date && (
            <div className="meta-chip2">
              <span className="meta-ico">📅</span>
              <span className="meta-txt">{reservation.date}</span>
            </div>
          )}
          <div className="meta-chips-div">
            {reservation?.time && (
              <div className="meta-chip">
                <span className="meta-ico">⏰</span>
                <span className="meta-txt">{reservation.time}</span>
              </div>
            )}
            {reservation?.room && (
              <div className="meta-chip">
                <span className="meta-ico">🏢</span>
                <span className="meta-txt">{reservation.room}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <label className="form-label">예약자</label>
      <input
        className="form-input yellow"
        placeholder="예약자 명을 입력해 주세요."
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSaving}
      />

      <div className="people-group">
        <span className="row-label">인원 수</span>
        <div className="counter">
          <button
            type="button"
            onClick={() => setCount(Math.max(2, count - 1))}
            disabled={count <= 2 || isSaving}
          >
            −
          </button>
          <span>{count}명</span>
          <button
            type="button"
            onClick={() => setCount(count + 1)}
            disabled={isSaving}
          >
            ＋
          </button>
        </div>
      </div>

      <label className="form-label">해당 반</label>
      <div className="class-group">
        {classes.map((c) => (
          <button
            type="button"
            key={c}
            className={`class-btn ${classType === c ? "selected" : ""}`}
            onClick={() => setClassType(c)}
            disabled={isSaving}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 임시비밀번호 불필요 판단 */}
      {/* <label className="form-label">예약 조회용 임시 비밀번호</label>
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        type="password"
                        autoComplete="one-time-code"
                        autoCorrect="off"
                        autoCapitalize="off"
                        disabled={isSaving}
                    />
                ))}
            </div> */}

      <div className="form-divider" />

      <div className="form-actions">
        <button
          type="button"
          className="form-submit danger"
          onClick={handleCancelReservation}
          disabled={!onCancel || isSaving}
        >
          예약 취소
        </button>

        <button
          type="button"
          className="form-submit secondary"
          onClick={onClose}
          disabled={isSaving}
        >
          나가기
        </button>

        <button
          type="button"
          className="form-submit"
          onClick={handleSave}
          disabled={!canSubmit || isSaving}
        >
          {isSaving ? "저장중..." : "수정하기"}
        </button>
      </div>
    </Modal>
  );
};

export default ReservationDetailModal;

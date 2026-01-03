import { useState } from "react";
import Modal from "./Modal";
import "../styles/check-modal.css";

const CheckModal = ({ onClose }) => {
  const [step, setStep] = useState("SEARCH");

  /* ===== 조회 입력 상태 ===== */
  const [pin, setPin] = useState(["", "", "", ""]);

  /* ===== 조회 결과 상태 (중요) ===== */
  const [resultTimes, setResultTimes] = useState([]);
  const [resultRoomsByTime, setResultRoomsByTime] = useState({});

  /* ===== 수정용 상태 ===== */
  const [count, setCount] = useState(4);
  const [classType, setClassType] = useState(null);

  const classes = ["임베디드", "클라우드", "웹/앱", "스마트팩토리", "IT/보안"];

  /* ===== 임시 조회 로직 (백엔드 붙이면 여기 교체) ===== */
  const handleSearch = () => {
    // 나중에 API 응답으로 대체될 부분
    const times = ["11:00-13:00", "14:00-16:00"];
    const roomsByTime = {
      "11:00-13:00": "회의실 2",
      "14:00-16:00": "회의실 3",
    };

    setResultTimes(times);
    setResultRoomsByTime(roomsByTime);
    setStep("RESULT");
  };

  return (
    <Modal type="center" onClose={onClose}>
      {/* ================= 조회 단계 ================= */}
      {step === "SEARCH" && (
        <>
          <div className="check-header">
            <h2 className="check-title">예약 내역 조회</h2>
          </div>

          <label className="check-label">예약자</label>
          <input
            className="check-input"
            placeholder="예약자명을 입력해 주세요."
          />

          <label className="check-label">예약 조회용 임시 비밀번호</label>
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

          <p className="check-hint">임시 비밀번호 4자리를 입력해 주세요.</p>

          <div className="check-divider" />

          <button className="check-submit" onClick={handleSearch}>
            예약 조회
          </button>
        </>
      )}

      {/* ================= 결과 단계 ================= */}
      {step === "RESULT" && (
        <>
          <div className="check-header">
            <h2 className="check-title">예약 내역 조회</h2>
          </div>

          {/* ===== 시간 + 회의실 요약 ===== */}
          {resultTimes.map((time) => (
            <div key={time} className="check-summary">
              {time} · {resultRoomsByTime[time]}
            </div>
          ))}

          {/* 예약자 */}
          <label className="check-label">예약자</label>
          <input className="check-input" />

          {/* 해당 반 */}
          <label className="check-label">해당 반</label>
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

          {/* 인원 수 */}
          <div className="people-group">
            <span className="row-label">인원 수</span>
            <div className="counter">
              <button onClick={() => setCount(Math.max(1, count - 1))}>
                −
              </button>
              <span>{count}명</span>
              <button onClick={() => setCount(count + 1)}>＋</button>
            </div>
          </div>

          <div className="check-divider" />

          {/* 하단 버튼 */}
          <div className="check-action-row">
            <button className="check-action yellow">예약 변경</button>
            <button className="check-action red">예약 취소</button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CheckModal;

import { useState, useRef } from "react";

import TimeSection from "../components/TimeSection";
import RoomSection from "../components/RoomSection";
import ConfirmModal from "../components/ConfirmModal";
import FormModal from "../components/FormModal";
import CheckModal from "../components/CheckModal";
import AdminModal from "../components/AdminModal";

import "../styles/layout.css";
import "../styles/time-section.css";

const Home = () => {
  const [step, setStep] = useState("TIME"); // TIME | ROOM
  const [modal, setModal] = useState(null); // null | CONFIRM | FORM | CHECK

  // 기존 단일 시간 → 복수 시간 배열로 변경
  const [selectedTimes, setSelectedTimes] = useState([]); // 추가: 최대 2개
  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomRef = useRef(null);

  // 시간 선택 변경 시 (자동 이동 X)
  const handleTimeChange = (times) => {
    setSelectedTimes(times);
  };

  // 다음 단계 버튼 클릭 시에만 이동
  const goToRoomStep = () => {
    if (selectedTimes.length === 0) return;

    setStep("ROOM");

    setTimeout(() => {
      roomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setModal("CONFIRM");
  };

  const handleComplete = () => {
    alert("예약 완료");
    setStep("TIME");
    setModal(null);
    setSelectedTimes([]); // 초기화
    setSelectedRoom(null);
  };

  return (
    <div className="container">
      {/* 헤더 */}
      <header className="header">
        <div className="header-inner">
          <img
            src="/rapa-logo.png"
            alt="DX 캠퍼스 로고"
            className="header-logo"
          />
          <button className="history-btn" onClick={() => setModal("CHECK")}>
            예약 내역
          </button>
          {/* 관리자용 임시 버튼 */}{" "}
          <button onClick={() => setModal("ADMIN")}>
            {" "}
            (임시) 관리자 조회 버튼{" "}
          </button>{" "}
          {modal === "ADMIN" && (
            <AdminModal
              open={true}
              onClose={() => setModal(null)}
              onForceCancel={(payload) => {
                console.log("강제취소", payload);
                setModal(null);
              }}
            />
          )}
        </div>
      </header>

      {/* 상단 안내 */}
      <section className="intro-section">
        <p className="intro-title">
          현대 오토에버 모빌리티 SW 스쿨
          <br />
          회의실 예약 관리 시스템
        </p>

        <div className="notice-box">
          <span>· 최대 2타임 · 10시 전 프로젝트 진행 과정 우선</span>
          <span className="notice-icon">ⓘ</span>
        </div>
      </section>

      {/* 시간 선택 */}
      <TimeSection
        selectedTimes={selectedTimes} // 변경
        onChange={handleTimeChange} // 변경
      />

      {/* 다음 단계 버튼 (추가) */}
      <button
        className="next-step-btn"
        disabled={selectedTimes.length === 0}
        onClick={goToRoomStep}
      >
        다음 단계
      </button>

      {/* 회의실 선택 */}
      {step === "ROOM" && (
        <div ref={roomRef} className="room-wrapper">
          <div className="section-header">
            <h2>회의실 선택</h2>
            <button
              className="close-btn"
              onClick={() => {
                setStep("TIME");
                setSelectedRoom(null);
                setSelectedTimes([]); // 추가
              }}
            >
              ✕
            </button>
          </div>

          <p className="room-desc">예약할 회의실을 선택해주세요.</p>

          <RoomSection
            selectedRoom={selectedRoom}
            onSelect={handleSelectRoom}
          />
        </div>
      )}

      {/* 모달들 */}
      {modal === "CONFIRM" && (
        <ConfirmModal
          times={selectedTimes} // 변경: 배열 전달
          room={selectedRoom}
          onNext={() => setModal("FORM")}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "FORM" && (
        <FormModal
          times={selectedTimes} // 변경
          room={selectedRoom}
          onSubmit={handleComplete}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "CHECK" && (
        <CheckModal
          onClose={() => setModal(null)}
          selectedTimes={selectedTimes} // 추가
          selectedRoom={selectedRoom} // 추가
        />
      )}
    </div>
  );
};

export default Home;

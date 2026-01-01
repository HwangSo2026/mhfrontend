import { useState, useRef } from "react";

import TimeSection from "../components/TimeSection";
import RoomSection from "../components/RoomSection";
import ConfirmModal from "../components/ConfirmModal";
import FormModal from "../components/FormModal";
import CheckModal from "../components/CheckModal";

import "../styles/layout.css";
import "../styles/time-section.css";

const Home = () => {
  const [step, setStep] = useState("TIME"); // TIME | ROOM
  const [modal, setModal] = useState(null); // null | CONFIRM | FORM | CHECK

  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomRef = useRef(null);

  const handleSelectTime = (time) => {
    setSelectedTime(time);
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
    setSelectedTime(null);
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
      <TimeSection selectedTime={selectedTime} onSelect={handleSelectTime} />

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
              }}
            >
              ✕
            </button>
          </div>

          {/* 안내 문구 */}
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
          time={selectedTime}
          room={selectedRoom}
          onNext={() => setModal("FORM")}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "FORM" && (
        <FormModal
          time={selectedTime}
          room={selectedRoom}
          onSubmit={handleComplete}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "CHECK" && <CheckModal onClose={() => setModal(null)} />}
    </div>
  );
};

export default Home;

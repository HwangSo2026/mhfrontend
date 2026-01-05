import { acquireHold, refreshHold, getRoomsStatus, releaseHold } from "../api/holdApi";
import { useState, useRef, useMemo, useEffect } from "react";

import TimeSection from "../components/TimeSection";
import RoomSection from "../components/RoomSection";
import ConfirmModal from "../components/ConfirmModal";
import FormModal from "../components/FormModal";
import CheckModal from "../components/CheckModal";
import AdminModal from "../components/AdminModal";
import Modal from "../components/Modal";

import "../styles/layout.css";
import "../styles/time-section.css";

// ✅ KST 기준 yyyy-mm-dd
function getTodayKST() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // "2026-01-03" 형태
}

const ROOMS = ["회의실 1", "회의실 2", "회의실 3", "회의실 4", "회의실 5", "회의실 6", "회의실 7"];

// ✅ time string -> part 키 (백엔드와 반드시 동일해야 함)
const TIME_TO_SLOT = {
  "08:00-09:00": "part1",
  "09:00-11:00": "part2",
  "11:00-13:00": "part3",
  "13:00-14:00": "part4",
  "14:00-16:00": "part5",
  "16:00-18:00": "part6",
  "18:00-20:00": "part7",
  "20:00-21:00": "part8",
};

const TIME_ORDER = [
  "08:00-09:00",
  "09:00-11:00",
  "11:00-13:00",
  "13:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00",
  "20:00-21:00",
];

const sortSelectionsByTime = (arr) =>
  [...arr].sort((a, b) => TIME_ORDER.indexOf(a.time) - TIME_ORDER.indexOf(b.time));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function timeToSlot(time) {
  return TIME_TO_SLOT[time]; // undefined면 백엔드 slot이랑 불일치
}

// ✅ "회의실 1" -> "1" (키를 짧게/통일)
function roomToKey(roomLabel) {
  // "회의실 1" -> "1"
  const m = String(roomLabel).match(/\d+/);
  return m ? m[0] : roomLabel;
}

const Home = () => {
  const [step, setStep] = useState("TIME"); // TIME | ROOM
  const [modal, setModal] = useState(null); // null | CONFIRM | FORM | CHECK | ADMIN

  // ✅ 핵심: time-room 매칭을 한 덩어리로 관리
  const [selections, setSelections] = useState([]); // [{ time: string, room: string|null }]
  const [roomPickIndex, setRoomPickIndex] = useState(0);

  const roomRef = useRef(null);

  // TimeSection이 아직 times 배열을 쓰니까, selections에서 파생
  const selectedTimes = useMemo(() => selections.map((s) => s.time), [selections]);

  const [heldMap, setHeldMap] = useState({}); // { "1": true/false ... }
  const [roomStatusLoading, setRoomStatusLoading] = useState(false);

  const SELECT_FEEDBACK_MS = 350;

  useEffect(() => {
    const shouldRefresh = modal === "CONFIRM" || modal === "FORM";
    if (!shouldRefresh) return;

    const interval = setInterval(async () => {
      try {
        const targets = selections.filter((s) => s.holdToken);
        if (targets.length === 0) return;

        await Promise.all(
          targets.map((s) =>
            refreshHold({
              date: s.date,
              slot: s.slot,
              room: s.roomKey,
              holdToken: s.holdToken,
            })
          )
        );
      } catch (e) {
        console.error(e);
        alert("선점이 만료되었어요. 다시 선택해주세요.");
        setModal(null);
        setStep("TIME");
        setSelections([]);
        setRoomPickIndex(0);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [modal, selections]);

  const handleTimeChange = (times) => {
    setSelections((prev) => {
      const prevMap = new Map(prev.map((s) => [s.time, s]));

      return times.map((t) => {
        const old = prevMap.get(t);

        // ✅ time은 유지하되, room/hold는 초기화(안전)
        return {
          time: t,
          room: old?.room ?? null,
          date: null,
          slot: null,
          roomKey: null,
          holdToken: null,
          expiresInSeconds: null,
        };
      });
    });

    setStep("TIME");
    setModal(null);
    setRoomPickIndex(0);
  };

  const goToRoomStep = () => {
    if (selections.length === 0) return;

    // ✅ 여기 추가: ROOM 들어가기 전에 시간순으로 정렬
    setSelections((prev) => sortSelectionsByTime(prev));

    setStep("ROOM");
    setRoomPickIndex(0);

    setTimeout(() => {
      roomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleSelectRoom = async (roomLabel) => {
    const date = getTodayKST();

    const nextSelections = selections.map((s, idx) => {
      if (idx !== roomPickIndex) return s;

      const slot = timeToSlot(s.time);
      const roomKey = roomToKey(roomLabel); // "회의실 1" -> "1"

      return {
        ...s,
        room: roomLabel, // 화면 표시용
        date,
        slot,
        roomKey,
      };
    });

    // ✅ 1) 먼저 선택 표시(색/체크) 되게 상태 반영
    setSelections(nextSelections);

    // ✅ 2) 잠깐 보여주고 넘어가게 딜레이
    await sleep(SELECT_FEEDBACK_MS);

    // ✅ 3) 다음 타임 선택으로 넘어가기
    if (roomPickIndex < nextSelections.length - 1) {
      setRoomPickIndex((p) => p + 1);
      return;
    }

    try {
      const results = await Promise.all(
        nextSelections.map((s) =>
          acquireHold({
            date: s.date,
            slot: s.slot,
            room: s.roomKey, // ✅ 서버 DTO room은 "1~7"
          })
        )
      );

      setSelections(
        nextSelections.map((s, i) => ({
          ...s,
          holdToken: results[i].holdToken,              // ✅ 응답 필드명
          expiresInSeconds: results[i].expiresInSeconds // ✅ 응답 필드명
        }))
      );

      setModal("CONFIRM");
    } catch (e) {
      console.error(e);

      // e.message가 JSON 문자열로 들어오는 구조라면
      let payload = null;
      try { payload = JSON.parse(e.message); } catch { }

      if (payload?.code === "HOLD_CONFLICT") {
        alert("이미 다른 사용자가 선점 중인 회의실이에요. 다른 회의실을 선택해주세요.");

        // ✅ 서버 상태 다시 받아와서 버튼 즉시 비활성화
        const date = getTodayKST();
        const slot = timeToSlot(currentSelection.time);
        if (slot) {
          try {
            const data = await getRoomsStatus({ date, slot });
            const map = {};
            for (const r of data.rooms ?? []) map[r.room] = !!r.held;
            setHeldMap(map);
          } catch { }
        }

        // ✅ ROOM 화면 유지해서 다시 고르게
        setModal(null);
        setStep("ROOM");
        return;
      }

      alert("선점(Hold)에 실패했어요. 다시 시도해주세요.");
    }
  };

  const cancelAndReset = async () => {
    try {
      const targets = selections.filter(s => s.holdToken);
      await Promise.all(
        targets.map(s =>
          releaseHold({
            date: s.date,
            slot: s.slot,
            room: s.roomKey,
            holdToken: s.holdToken,
          })
        )
      );
    } catch (e) {
      console.error(e);
      // 실패해도 TTL로 풀림. UX상 그냥 리셋 진행해도 됨.
    } finally {
      setModal(null);
      setStep("TIME");
      setSelections([]);
      setRoomPickIndex(0);
    }
  };

  const handleComplete = () => {
    setModal("DONE"); // ✅ alert 대신 완료 모달
  };

  const resetAll = () => {
    setStep("TIME");
    setModal(null);
    setSelections([]);
    setRoomPickIndex(0);
  };

  const currentSelection = selections[roomPickIndex]; // { time, room }

  useEffect(() => {
    if (step !== "ROOM") return;
    if (!currentSelection?.time) return;

    const date = getTodayKST();
    const slot = timeToSlot(currentSelection.time);
    if (!slot) return;

    let cancelled = false;
    setRoomStatusLoading(true);

    getRoomsStatus({ date, slot })
      .then((data) => {
        if (cancelled) return;

        // rooms: [{room:"1", held:true, ttlSeconds: 20}, ...]
        const map = {};
        for (const r of data.rooms ?? []) {
          map[r.room] = !!r.held;
        }
        setHeldMap(map);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setHeldMap({});
      })
      .finally(() => {
        if (!cancelled) setRoomStatusLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, roomPickIndex, currentSelection?.time]);

  return (
    <>
      {/* 헤더 */}
      <header className="header">
        <div className="header-inner">
          <img src="/rapa-logo.png" alt="DX 캠퍼스 로고" className="header-logo" />

          <button className="history-btn" onClick={() => setModal("CHECK")}>
            예약 내역
          </button>

          {/* 임시 관리자 버튼 */}
          <button className="admin-btn" onClick={() => setModal("ADMIN")}>(임시) 관리자</button>
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

      <div className="container">

        {/* 상단 안내 */}
        <section className="intro-section">
          <p className="intro-title">
            현대 오토에버 모빌리티 SW 스쿨
            <br />
            회의실 예약 관리 시스템
          </p>

          <div className="notice-box">
            <span>· 최대 2타임 ·</span>
            <span className="notice-box-span2">10시 전 프로젝트 진행 과정 우선</span>
            <span className="notice-icon">ⓘ</span>
          </div>
        </section>

        {/* 시간 선택 */}
        <TimeSection selectedTimes={selectedTimes} onChange={handleTimeChange} />

        {/* 다음 단계 버튼 */}
        <button
          className="next-step-btn"
          disabled={selections.length === 0}
          onClick={goToRoomStep}
        >
          다음 단계
        </button>

        {/* 회의실 선택 */}
        {step === "ROOM" && (
          <div ref={roomRef} className="room-wrapper">
            <div className="section-header">
              <span className="room-span">회의실 선택</span>
              <button className="close-btn" onClick={cancelAndReset}>
                ✕
              </button>
            </div>

            <div className="room-div-span">
              <p className="room-desc">
                {selections.length === 2
                  ? `${roomPickIndex + 1}번째 회의실을 선택해주세요. (${currentSelection?.time})`
                  : `예약할 회의실을 선택해주세요. (${currentSelection?.time})`}
              </p>
            </div>


            <RoomSection
              rooms={ROOMS}
              selectedRoom={currentSelection?.room ?? null}
              onSelect={handleSelectRoom}
              heldMap={heldMap}
              loading={roomStatusLoading}
            />
          </div>
        )}

        {/* 모달들 */}
        {modal === "CONFIRM" && (
          <ConfirmModal
            selections={selections}
            onNext={() => setModal("FORM")}
            onClose={cancelAndReset}
          />
        )}

        {modal === "FORM" && (
          <FormModal
            selections={selections}
            onSubmit={handleComplete}
            onClose={cancelAndReset}
          />
        )}

        {modal === "CHECK" && (
          <CheckModal
            onClose={() => setModal(null)}
            selections={selections}      // ✅ 변경
          />
        )}

        {modal === "DONE" && (
          <Modal type="center" onClose={resetAll}>
            <div style={{ padding: 16, textAlign: "center" }}>
              <h2 style={{ marginBottom: 8 }}>예약 완료 🎉</h2>
              <p style={{ marginBottom: 16, color: "#6b7280" }}>
                예약이 정상적으로 등록됐어요.
              </p>
              <button type="button" className="form-submit" onClick={resetAll}>
                확인
              </button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default Home;
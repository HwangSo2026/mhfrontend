import { useEffect, useMemo, useState } from "react";
import "../styles/admin-modal.css";
import RoomDropdown from "./RoomDropdown";
import { adminReadAll, adminForceDelete } from "../api/reservationApi"; // ✅ 바꿈

const ROOMS = [
  "회의실 1",
  "회의실 2",
  "회의실 3",
  "회의실 4",
  "회의실 5",
  "회의실 6",
  "회의실 7",
];

const SLOT_META = [
  { id: 1, slot: "part1", time: "08:00 - 09:00" },
  { id: 2, slot: "part2", time: "09:00 - 11:00" },
  { id: 3, slot: "part3", time: "11:00 - 13:00" },
  { id: 4, slot: "part4", time: "13:00 - 14:00" },
  { id: 5, slot: "part5", time: "14:00 - 16:00" },
  { id: 6, slot: "part6", time: "16:00 - 18:00" },
  { id: 7, slot: "part7", time: "18:00 - 20:00" },
  { id: 8, slot: "part8", time: "20:00 - 21:00" },
];

const AdminModal = ({ open, onClose, token }) => {
  // ✅ token 받기
  const [room, setRoom] = useState(ROOMS[0]);
  const [selectedId, setSelectedId] = useState(1);

  const [slots, setSlots] = useState(
    SLOT_META.map((s) => ({ ...s, used: false, badge: "미사용", _raw: null }))
  );

  const selected = useMemo(
    () => slots.find((s) => s.id === selectedId),
    [slots, selectedId]
  );

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [head, setHead] = useState(1);

  const date = useMemo(() => {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

  const roomNo = useMemo(() => String(ROOMS.indexOf(room) + 1), [room]);

  // ✅ 슬롯 8개 조회 (slot마다 readAll 1번) -> roomNo만 골라서 표시
  useEffect(() => {
    if (!open) return;
    if (!token) return; // ✅ 토큰 없으면 조회 금지

    const fetchSlots = async () => {
      const results = await Promise.all(
        SLOT_META.map(async (s) => {
          try {
            const list = await adminReadAll({ date, slot: s.slot, token }); // ✅ readAll

            // list: [{date, slot, room, reservation:{...}}, ...]
            const found = (list ?? []).find((x) => String(x.room) === roomNo);

            if (!found || !found.reservation) {
              return { ...s, used: false, badge: "미사용", _raw: null };
            }

            return {
              ...s,
              used: true,
              badge: found.reservation.name ?? "사용중",
              _raw: found,
            };
          } catch (e) {
            console.error(e);
            return { ...s, used: false, badge: "미사용", _raw: null };
          }
        })
      );

      setSlots(results);

      const cur = results.find((x) => x.id === selectedId);
      if (!cur?.used) {
        const firstUsed = results.find((x) => x.used);
        setSelectedId(firstUsed ? firstUsed.id : 1);
      }
    };

    fetchSlots();
  }, [open, roomNo, token, date, selectedId]);

  // ✅ 선택된 슬롯 상세 반영
  useEffect(() => {
    if (!open) return;

    if (!selected?.used || !selected?._raw) {
      setName("");
      setCourse("");
      setHead(1);
      return;
    }

    setName(selected._raw.reservation?.name ?? "");
    setCourse(selected._raw.reservation?.course ?? "");
    setHead(selected._raw.reservation?.headcount ?? 1);
  }, [open, selected]);

  if (!open) return null;

  const handleForceCancel = async () => {
    if (!selected?.used) return;
    if (!token) {
      alert("관리자 토큰이 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      await adminForceDelete({
        date,
        slot: selected.slot,
        room: roomNo,
        token,
      });

      // ✅ 취소 후: 현재 슬롯 상태만 즉시 갱신(간단 버전)
      setSlots((prev) =>
        prev.map((s) =>
          s.id === selected.id
            ? { ...s, used: false, badge: "미사용", _raw: null }
            : s
        )
      );
      setName("");
      setCourse("");
      setHead(1);
    } catch (e) {
      console.error(e);
      alert("강제 취소 실패 (토큰/서버 확인)");
    }
  };

  return (
    <div className="admin-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <div className="admin-title">관리자 조회</div>
          <button className="admin-close" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>

        <div className="admin-divider" />

        <div className="admin-body">
          <RoomDropdown value={room} options={ROOMS} onChange={setRoom} />

          <div className="admin-slots">
            {slots.map((s) => {
              const active = s.id === selectedId;
              const disabled = !s.used;

              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={disabled}
                  className={[
                    "admin-slot",
                    active ? "is-active" : "",
                    disabled ? "is-disabled" : "",
                  ].join(" ")}
                  onClick={() => !disabled && setSelectedId(s.id)}
                >
                  <span className="admin-slotTime">{s.time}</span>
                  <span
                    className={disabled ? "admin-badge is-gray" : "admin-badge"}
                  >
                    {s.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="admin-divider admin-divider--low" />

          <div className="admin-form">
            <div className="admin-row">
              <div className="admin-label">예약자</div>
              <input className="admin-input" value={name} readOnly />
            </div>

            <div className="admin-row">
              <div className="admin-label">해당 반</div>
              <input className="admin-input" value={course} readOnly />
            </div>

            <div className="admin-row">
              <div className="admin-label">인원 수</div>
              <input className="admin-input" value={`${head}명`} readOnly />
            </div>

            <button
              className="admin-danger"
              type="button"
              onClick={handleForceCancel}
              disabled={!selected?.used}
            >
              강제 예약 취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;

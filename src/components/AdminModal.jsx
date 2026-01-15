import { useEffect, useMemo, useState } from "react";
import "../styles/admin-modal.css";
import RoomDropdown from "./RoomDropdown";

const ROOMS = [
  "회의실 1",
  "회의실 2",
  "회의실 3",
  "회의실 4",
  "회의실 5",
  "회의실 6",
  "회의실 7",
];

const SLOT_SEED = [
  {
    id: 1,
    time: "08:00 - 09:00",
    used: true,
    badge: "호날두",
    name: "호날두",
    course: "웹/앱",
    gen: 3,
    head: 4,
  },
  {
    id: 2,
    time: "09:00 - 11:00",
    used: true,
    badge: "산체스",
    name: "산체스",
    course: "클라우드",
    gen: 2,
    head: 3,
  },
  {
    id: 3,
    time: "11:00 - 13:00",
    used: true,
    badge: "달롯",
    name: "달롯",
    course: "보안",
    gen: 1,
    head: 2,
  },
  { id: 4, time: "13:00 - 14:00", used: false, badge: "미사용" },
  { id: 5, time: "14:00 - 16:00", used: false, badge: "미사용" },
  {
    id: 6,
    time: "16:00 - 18:00",
    used: true,
    badge: "브페",
    name: "브루노",
    course: "웹/앱",
    gen: 3,
    head: 4,
  },
  { id: 7, time: "18:00 - 20:00", used: false, badge: "미사용" },
  {
    id: 8,
    time: "20:00 - 21:00",
    used: true,
    badge: "박지성",
    name: "박지성",
    course: "웹/앱",
    gen: 3,
    head: 5,
  },
];

const AdminModal = ({ open, onClose, onForceCancel }) => {
  const [room, setRoom] = useState(ROOMS[0]);
  const [selectedId, setSelectedId] = useState(6);

  const slots = useMemo(() => SLOT_SEED, []);
  const selected = useMemo(
    () => slots.find((s) => s.id === selectedId),
    [slots, selectedId]
  );

  const [name, setName] = useState("");
  const [course, setCourse] = useState("웹/앱");
  const [gen, setGen] = useState(1);
  const [head, setHead] = useState(1);

  useEffect(() => {
    if (!open) return;

    const handler = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    if (!selected || !selected.used) {
      setName("");
      setCourse("웹/앱");
      setGen(1);
      setHead(1);
      return;
    }
    setName(selected.name ?? "");
    setCourse(selected.course ?? "웹/앱");
    setGen(selected.gen ?? 1);
    setHead(selected.head ?? 1);
  }, [open, selected]);

  if (!open) return null;

  const handleForceCancel = () => {
    if (!selected?.used) return;
    onForceCancel?.({ room, slotId: selected.id });
  };

  return (
    <div className="admin-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        {/* ✅ 헤더 */}
        <div className="admin-header">
          <div className="admin-title">관리자 조회</div>
          <button className="admin-close" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>

        <div className="admin-divider" />

        {/* ✅ 바디(여기만 스크롤) */}
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

            {/* <div className="admin-row">
              <div className="admin-label">기수</div>
              <input className="admin-input" value={`${gen}기`} readOnly />
            </div> */}

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

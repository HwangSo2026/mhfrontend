// 선점 + 토큰 API
export async function acquireHold(payload) {
  const res = await fetch("/api/holds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `acquireHold failed: ${res.status}`);
  }

  const data = await res.json(); // ✅ 여기서 한번만 읽기

  saveHoldToken({ ...payload, holdToken: data.holdToken }); // ✅ 저장

  return data; // ✅ { holdToken, expiresInSeconds }
}

// 선점 갱신 API
export async function refreshHold(payload) {
  const holdToken =
    payload.holdToken ??
    getHoldToken({ date: payload.date, slot: payload.slot, room: payload.room });

  if (!holdToken) {
    throw new Error("NO_HOLD_TOKEN");
  }

  const res = await fetch("/api/holds/refresh", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, holdToken }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `refreshHold failed: ${res.status}`);
  }
}


// 방 전체 조회 API
export async function getRoomsStatus({ date, slot }) {
  const qs = new URLSearchParams({ date, slot }).toString();
  const res = await fetch(`/api/holds/rooms-status?${qs}`);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `getRoomsStatus failed: ${res.status}`);
  }

  return res.json();
  // { date, slot, rooms: [{ room: "1", held: true/false, ttlSeconds: number }, ...] }
}

// 선점 취소
export async function releaseHold(payload) {
  const res = await fetch("/api/holds/release", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // {date, slot, room, holdToken}
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `releaseHold failed: ${res.status}`);
  }

  removeHoldToken(payload); // 토큰 삭제
}


// 브라우저 sessionStorage 설정
const makeHoldKey = (date, slot, room) => `hold:${date}:${slot}:${room}`;

// 세션스토리지 토큰 저장
export function saveHoldToken({ date, slot, room, holdToken }) {
  sessionStorage.setItem(makeHoldKey(date, slot, room), holdToken);
}

// 세션스토리지 토큰 조회
export function getHoldToken({ date, slot, room }) {
  return sessionStorage.getItem(makeHoldKey(date, slot, room));
}

// 토큰 제거
export function removeHoldToken({ date, slot, room }) {
  sessionStorage.removeItem(makeHoldKey(date, slot, room));
}

// 모든 토큰 조회
export function getAllHoldKeys() {
  return Object.keys(sessionStorage).filter((k) => k.startsWith("hold:"));
}


// 선점 + 토큰 API
export async function acquireHold(payload) {
  const res = await fetch("/api/holds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // {date, slot, room}
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `acquireHold failed: ${res.status}`);
  }

  return res.json(); // { holdToken, expiresInSeconds }
}

// 선점 갱신 API
export async function refreshHold(payload) {
  const res = await fetch("/api/holds/refresh", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // {date, slot, room, holdToken}
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
}
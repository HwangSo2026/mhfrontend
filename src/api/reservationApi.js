import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// 예약 확정
export async function createReservation(payload) {
  const res = await client.post("/reservations", payload);
  return res.data;
}

// 예약 조회 (slot 단위)
export async function searchReservation({ date, slot, name, password }) {
  const res = await client.get("/reservations", {
    params: { date, slot, name, password },
  });
  return res.data;
}

// 예약 수정 (Change)
export async function updateReservation({ date, slot, room, payload }) {
  const res = await client.put(
    `/reservations/${date}/${slot}/${room}`,
    payload
  );
  return res.data;
}

// 예약 삭제 (Delete)
export async function deleteReservation({ date, slot, room, password }) {
  const res = await client.delete(`/reservations/${date}/${slot}/${room}`, {
    data: { password }, // DELETE는 body에 넣어야 함
  });
  return res.data;
}

// ================  관리자용 ================

// 관리자 로그인
export async function adminLogin({ name, password }) {
  const res = await client.post("/admin/login", { name, password });
  return res.data; // { role: "admin", token: "..." }
}

// 관리자 슬롯 전체 조회
export async function adminReadAll({ date, slot, token }) {
  const res = await client.get("/admin/reservations", {
    params: { date, slot },
    headers: { "X-Admin-Token": String(token ?? "") },
  });
  return res.data;
}

// 관리자 강제 취소
export async function adminForceDelete({ date, slot, room, token }) {
  const res = await client.delete(`/admin/reservations/${date}/${slot}/${room}`, {
    headers: { "X-Admin-Token": String(token ?? "") },
  });
  return res.data;
}

// 관리자 해당 회의실 조회
export async function adminReadRoom({ date, room, token }) {
  const res = await client.get(`/admin/rooms/${date}/${room}`, {
    headers: { "X-Admin-Token": token },
  });
  return res.data; // part1~part8 중 예약 있는 것만(또는 8개 전부)
}

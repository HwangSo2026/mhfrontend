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

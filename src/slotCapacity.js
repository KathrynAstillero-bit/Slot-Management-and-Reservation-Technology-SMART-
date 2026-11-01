export const DEFAULT_CAPACITY = 30;
export const SLOT_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];
export const slotCapacity = (data, officeId, date, time) =>
  data.slotLimits?.find(
    (s) => s.officeId === officeId && s.date === date && s.time === time,
  )?.limit ?? DEFAULT_CAPACITY;
export const reservedCount = (data, officeId, date, time) =>
  data.bookings.filter(
    (b) =>
      b.officeId === officeId &&
      b.date === date &&
      b.time === time &&
      b.status !== "cancelled" &&
      b.type !== "walk-in",
  ).length;

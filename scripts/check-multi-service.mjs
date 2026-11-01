import assert from "node:assert/strict";
const storage = () => {
  const items = new Map();
  return {
    getItem: (k) => items.get(k) || null,
    setItem: (k, v) => items.set(k, v),
    removeItem: (k) => items.delete(k),
  };
};
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
const { api, post, serviceName } = await import("../src/api.js");
await post("/login", {
  identifier: "2026-01-123",
  password: "SlotStudent!2026",
  role: "student",
});
let data = await api("/state");
let day = new Date(`${data.today}T12:00:00+08:00`);
do {
  day.setUTCDate(day.getUTCDate() + 1);
} while ([0, 6].includes(day.getUTCDay()));
const date = day.toISOString().slice(0, 10);
const base = {
  officeId: "accounting",
  date,
  time: "10:00",
  studentName: "Test Student",
  studentNumber: "2026-01-123",
};
const multi = (
  await post("/bookings", {
    ...base,
    serviceIds: ["clearance", "permit", "clearance"],
  })
).booking;
assert.deepEqual(multi.serviceIds, ["clearance", "permit"]);
assert.equal(
  serviceName(data, "accounting", multi.serviceIds),
  "Clearance, Permit",
);
data = await api("/state");
assert.equal(
  data.slotCounts.find((s) => s.officeId === "accounting" && s.date === date)
    .count,
  1,
);
await assert.rejects(
  () => post("/bookings", { ...base, serviceIds: [] }),
  /Select at least one/,
);
await assert.rejects(
  () => post("/bookings", { ...base, serviceIds: ["payment"] }),
  /unavailable/,
);
const single = (await post("/bookings", { ...base, serviceId: "discount" }))
  .booking;
assert.deepEqual(single.serviceIds, ["discount"]);
assert.equal(serviceName(data, "accounting", "permit"), "Permit");
await post("/logout", {});
await post("/login", {
  identifier: "accounting@demo.local",
  password: "SlotAccounting!2026",
  role: "accounting",
});
await post("/availability", {
  kind: "service",
  officeId: "accounting",
  serviceId: "permit",
  enabled: false,
});
await post("/logout", {});
await post("/login", {
  identifier: "2026-01-123",
  password: "SlotStudent!2026",
  role: "student",
});
await assert.rejects(
  () => post("/bookings", { ...base, serviceIds: ["clearance", "permit"] }),
  /unavailable/,
);
assert.equal((await api("/state")).bookings.length, 2);
console.log(
  "Multi-service checks passed: combined names, deduplication, one-slot counting, legacy booking, empty/cross-office/disabled service rejection.",
);

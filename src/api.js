import { queueOrder } from "./queuePosition.js";
import {
  DEFAULT_CAPACITY,
  SLOT_TIMES,
  slotCapacity,
  reservedCount,
} from "./slotCapacity.js";
import { selectedServiceIds } from "./serviceSelection.js";

export const demoAccounts = [
  {
    id: "student",
    name: "Juan F. Smith",
    email: "student@demo.local",
    studentId: "2026-01-123",
    role: "student",
    password: "SlotStudent!2026",
  },
  {
    id: "cashier",
    name: "Ma’am Jeanie Benzon",
    email: "cashier@demo.local",
    role: "cashier",
    password: "SlotCashier!2026",
  },
  {
    id: "accounting",
    name: "Mr. Edwin F. Llamera",
    email: "accounting@demo.local",
    role: "accounting",
    password: "SlotAccounting!2026",
  },
  {
    id: "admin",
    name: "Administrator",
    email: "admin@demo.local",
    role: "admin",
    password: "SlotAdmin!2026",
  },
];
const storageKey = "ccdi-slot-ui-v1";
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const initial = () => ({
  offices: [
    {
      id: "cashier",
      name: "Cashier",
      enabled: true,
      services: [
        { id: "payment", name: "Payment", enabled: true },
        { id: "promissory", name: "Promissory Note", enabled: true },
      ],
    },
    {
      id: "accounting",
      name: "Accounting",
      enabled: true,
      services: [
        { id: "clearance", name: "Clearance", enabled: true },
        { id: "permit", name: "Permit", enabled: true },
        { id: "uniform", name: "Uniform Fabric", enabled: true },
        { id: "discount", name: "Discount inquiry", enabled: true },
      ],
    },
  ],
  bookings: [],
  blockedDates: [],
  blockedTimes: [],
  accounts: demoAccounts.map(({ password, ...a }) => a),
});
function read() {
  let state;
  try {
    state = JSON.parse(localStorage.getItem(storageKey)) || initial();
  } catch {
    state = initial();
  }
  state.accounts = state.accounts.map((a) =>
    (a.id === "cashier" || a.email === "cashier@demo.local") &&
    a.name === "Cashier Staff"
      ? { ...a, name: "Ma’am Jeanie Benzon" }
      : a,
  );
  if (!state.accountingStaffNameUpdated) {
    state.accounts = state.accounts.map((a) =>
      a.id === "accounting" || a.email === "accounting@demo.local"
        ? { ...a, name: "Mr. Edwin F. Llamera" }
        : a,
    );
    state.accountingStaffNameUpdated = true;
  }
  const inquiry = state.offices
    ?.find((o) => o.id === "accounting")
    ?.services.find((s) => s.id === "discount");
  if (inquiry) inquiry.name = "Discount inquiry";
  return state;
}
function save(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    throw new Error(
      "Browser storage is unavailable. Allow local storage to use this UI demo.",
    );
  }
}
let previewRole = "";
export function setPreviewRole(value) {
  previewRole = value;
}
function session() {
  try {
    return JSON.parse(sessionStorage.getItem("ccdi-demo-session"));
  } catch {
    return null;
  }
}
function user() {
  const stored = session();
  if (!stored) return null;
  const state = read();
  const mapping = state.accounts.find(
    (a) => a.id === stored.id || a.email === stored.email,
  );
  const u = {
    ...stored,
    name: state.profiles?.[stored.id]?.name || mapping?.name || stored.name,
  };
  if (u.role === "admin" && previewRole === "student") {
    const { password, ...student } = demoAccounts.find(
      (account) => account.role === "student",
    );
    return {
      ...student,
      name:
        state.profiles?.[student.id]?.name ||
        state.accounts.find(
          (a) => a.id === student.id || a.email === student.email,
        )?.name ||
        student.name,
    };
  }
  return {
    ...u,
    role: u.role === "admin" && previewRole ? previewRole : u.role,
  };
}
export async function api(path, options = {}) {
  const url = new URL(path, "https://ui.demo"),
    body = options.body ? JSON.parse(options.body) : {},
    state = read(),
    u = user(),
    actual = session();
  if (url.pathname === "/session")
    return { user: u, actualRole: actual?.role, localDemo: true };
  if (url.pathname === "/login") {
    const account = demoAccounts.find(
      (a) =>
        (a.role === "student" ? a.studentId : a.email).toLowerCase() ===
          String(body.identifier || body.email || "")
            .trim()
            .toLowerCase() &&
        a.password === body.password &&
        (!body.role || a.role === body.role),
    );
    if (!account)
      throw new Error(
        "The credentials do not match. Check your ID or email and password.",
      );
    const { password, ...base } = account;
    const safe = {
      ...base,
      name:
        state.profiles?.[base.id]?.name ||
        state.accounts.find((a) => a.id === base.id || a.email === base.email)
          ?.name ||
        base.name,
    };
    sessionStorage.setItem("ccdi-demo-session", JSON.stringify(safe));
    previewRole = "";
    return { user: safe, actualRole: safe.role, localDemo: true };
  }
  if (url.pathname === "/logout") {
    sessionStorage.removeItem("ccdi-demo-session");
    previewRole = "";
    return { ok: true };
  }
  if (url.pathname === "/verify") {
    const token = url.searchParams.get("token");
    const booking = state.bookings.find((b) => b.token === token);
    return {
      valid: !!booking && booking.status === "booked",
      booking: booking ? { ...booking } : null,
      demo: true,
    };
  }
  if (!u) throw new Error("Please sign in to a account.");
  const staff = (office) => u.role === "admin" || u.role === office;
  const ownsBooking = (booking) =>
    booking.studentId === u.id ||
    (actual.role === "admin" &&
      u.role === "student" &&
      booking.studentId === actual.id);
  if (url.pathname === "/state")
    return {
      ...state,
      currentProfile:
        u.role === "student"
          ? state.profiles?.[u.id] || {
              name: u.name,
              number: u.studentId,
              course: "",
            }
          : null,
      queueUpdatedAt: new Date().toISOString(),
      queueEntries: state.bookings
        .filter((b) => ["booked", "checked-in"].includes(b.status))
        .map((b) => ({
          officeId: b.officeId,
          date: b.date,
          time: b.time,
          status: b.status,
          queueNumber: b.queueNumber,
          createdAt: b.createdAt || "",
          checkedInAt: b.checkedInAt || "",
        })),
      queueSummary: state.offices.map((o) => {
        const entries = state.bookings.filter(
          (b) => b.officeId === o.id && b.date === today(),
        );
        return {
          officeId: o.id,
          reserved: entries.filter((b) => b.status === "booked").length,
          checkedIn: entries
            .filter((b) => b.status === "checked-in")
            .sort(queueOrder)
            .map((b) => b.queueNumber),
        };
      }),
      bookings: state.bookings.filter(
        (b) =>
          u.role === "admin" ||
          u.role === b.officeId ||
          (u.role === "student" && ownsBooking(b)),
      ),
      slotCounts: state.bookings
        .filter((b) => b.status !== "cancelled" && b.type !== "walk-in")
        .reduce((arr, b) => {
          let x = arr.find(
            (x) =>
              x.officeId === b.officeId &&
              x.date === b.date &&
              x.time === b.time,
          );
          if (x) x.count++;
          else
            arr.push({
              officeId: b.officeId,
              date: b.date,
              time: b.time,
              count: 1,
            });
          return arr;
        }, []),
      today: today(),
      times: SLOT_TIMES,
      capacity: DEFAULT_CAPACITY,
      slotLimits: state.slotLimits || [],
    };
  if (url.pathname === "/profile") {
    if (u.role !== "student")
      throw new Error("Use the Student account to update this profile.");
    const name = String(body.name || "").trim();
    if (!name || name.length > 100)
      throw new Error("Enter a student name up to 100 characters.");
    state.profiles = {
      ...state.profiles,
      [u.id]: {
        name,
        number: u.studentId,
        course: String(body.course || "").slice(0, 150),
      },
    };
    state.bookings = state.bookings.map((b) =>
      ownsBooking(b) ? { ...b, studentName: name } : b,
    );
    state.accounts = state.accounts.map((a) =>
      a.id === u.id || a.email === u.email ? { ...a, name } : a,
    );
    save(state);
    return { ok: true };
  }
  if (url.pathname === "/slot-limits") {
    if (!staff(body.officeId))
      throw new Error("Use the corresponding office account.");
    if (
      !state.offices.some((o) => o.id === body.officeId) ||
      !SLOT_TIMES.includes(body.time) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
      body.date < today() ||
      [0, 6].includes(new Date(body.date + "T12:00:00+08:00").getUTCDay()) ||
      new Date(`${body.date}T${body.time}:00+08:00`) <= new Date()
    )
      throw new Error("Choose a future weekday and hourly slot.");
    if (!Number.isInteger(body.limit) || body.limit < 1 || body.limit > 300)
      throw new Error("Enter a whole number from 1 to 300.");
    if (body.limit < reservedCount(state, body.officeId, body.date, body.time))
      throw new Error("The limit cannot be lower than existing reservations.");
    state.slotLimits = (state.slotLimits || []).filter(
      (s) =>
        !(
          s.officeId === body.officeId &&
          s.date === body.date &&
          s.time === body.time
        ),
    );
    if (body.limit !== DEFAULT_CAPACITY)
      state.slotLimits.push({
        officeId: body.officeId,
        date: body.date,
        time: body.time,
        limit: body.limit,
      });
    save(state);
    return { ok: true };
  }
  if (url.pathname === "/walkins") {
    if (!staff(body.officeId))
      throw new Error("Use the corresponding office account.");
    const office = state.offices.find((o) => o.id === body.officeId),
      date = today();
    const hour =
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        hourCycle: "h23",
      }).format(new Date()) + ":00";
    if (
      !office?.enabled ||
      !SLOT_TIMES.includes(hour) ||
      [0, 6].includes(new Date(date + "T12:00:00+08:00").getUTCDay()) ||
      state.blockedDates.some(
        (s) => s.officeId === body.officeId && s.date === date,
      ) ||
      state.blockedTimes.some(
        (s) =>
          s.officeId === body.officeId && s.date === date && s.time === hour,
      )
    )
      throw new Error(
        "Walk-ins can be admitted only during an open office hour.",
      );
    const serviceIds = selectedServiceIds(office, body);
    if (
      !String(body.studentName || "").trim() &&
      !String(body.studentNumber || "").trim()
    )
      throw new Error(
        "Enter a student name or student ID; either one is enough.",
      );
    const number =
      state.bookings.filter(
        (b) =>
          b.officeId === body.officeId &&
          b.date === date &&
          b.type === "walk-in",
      ).length + 1;
    const booking = {
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      type: "walk-in",
      officeId: body.officeId,
      studentName: String(body.studentName || "")
        .trim()
        .slice(0, 100),
      studentNumber: String(body.studentNumber || "")
        .trim()
        .slice(0, 40),
      serviceIds,
      serviceId: serviceIds[0],
      date,
      time: hour,
      status: "checked-in",
      checkedInAt: new Date().toISOString(),
      queueNumber: `${body.officeId === "cashier" ? "C" : "A"}-W${String(number).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };
    state.bookings.push(booking);
    save(state);
    return { booking };
  }
  if (url.pathname === "/availability") {
    if (!staff(body.officeId))
      throw new Error("Use the corresponding office account.");
    const office = state.offices.find((o) => o.id === body.officeId);
    if (!office) throw new Error("Office not found.");
    if (body.kind === "office") office.enabled = body.enabled;
    else if (body.kind === "service") {
      const s = office.services.find((s) => s.id === body.serviceId);
      if (s) s.enabled = body.enabled;
    } else {
      const key = body.kind === "date" ? "blockedDates" : "blockedTimes";
      state[key] = state[key].filter(
        (x) =>
          !(
            x.officeId === body.officeId &&
            x.date === body.date &&
            (body.kind === "date" || x.time === body.time)
          ),
      );
      if (!body.enabled)
        state[key].push({
          officeId: body.officeId,
          date: body.date,
          ...(body.kind === "time" ? { time: body.time } : {}),
        });
    }
    save(state);
    return { ok: true };
  }
  if (url.pathname === "/bookings" && options.method === "POST") {
    if (u.role !== "student")
      throw new Error("Use the Student account to reserve a slot.");
    const office = state.offices.find((o) => o.id === body.officeId);
    const serviceIds = selectedServiceIds(office, body);
    const unavailable =
      !office?.enabled ||
      body.date < today() ||
      [0, 6].includes(new Date(body.date + "T12:00:00+08:00").getUTCDay()) ||
      state.blockedDates.some(
        (x) => x.officeId === body.officeId && x.date === body.date,
      ) ||
      state.blockedTimes.some(
        (x) =>
          x.officeId === body.officeId &&
          x.date === body.date &&
          x.time === body.time,
      ) ||
      new Date(`${body.date}T${body.time}:00+08:00`) <= new Date() ||
      reservedCount(state, body.officeId, body.date, body.time) >=
        slotCapacity(state, body.officeId, body.date, body.time);
    if (unavailable)
      throw new Error(
        "That slot is no longer available. Choose another date or time.",
      );
    const number =
      state.bookings.filter(
        (b) => b.officeId === body.officeId && b.date === body.date,
      ).length + 1;
    const booking = {
      ...body,
      studentName: state.profiles?.[u.id]?.name || body.studentName,
      serviceIds,
      serviceId: serviceIds[0],
      id: crypto.randomUUID(),
      queueNumber: `${body.officeId === "cashier" ? "C" : "A"}-${String(number).padStart(3, "0")}`,
      studentId: u.id,
      status: "booked",
      token: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    state.bookings.push(booking);
    save(state);
    return { booking };
  }
  if (url.pathname === "/checkin") {
    const booking = state.bookings.find((b) => b.token === body.token);
    if (!booking) throw new Error("ticket not found in this browser.");
    if (!staff(booking.officeId))
      throw new Error("This ticket belongs to another office.");
    if (booking.status !== "booked")
      throw new Error(`Ticket is already ${booking.status}.`);
    if (booking.date !== today())
      throw new Error(
        "Counter admission is available only on the appointment date (Manila time).",
      );
    booking.status = "checked-in";
    booking.checkedInAt = new Date().toISOString();
    save(state);
    return { booking };
  }
  if (url.pathname.match(/^\/bookings\/.+\/status$/)) {
    const id = url.pathname.split("/")[2],
      booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw new Error("Reservation not found.");
    if (!(
      staff(booking.officeId) ||
      (u.role === "student" &&
        ownsBooking(booking) &&
        body.status === "cancelled")
    ))
      throw new Error("This action is unavailable for this account.");
    if (!["cancelled", "completed"].includes(body.status))
      throw new Error("Choose a valid reservation action.");
    if (body.status === "completed" && booking.status !== "checked-in")
      throw new Error("Admit the student at the counter before completing the visit.");
    if (["completed", "cancelled"].includes(booking.status))
      throw new Error("This visit is already closed.");
    booking.status = body.status;
    save(state);
    return { booking };
  }
  if (url.pathname === "/accounts") {
    if (u.role !== "admin") throw new Error("Use the Admin account.");
    const email = String(body.email || "")
        .trim()
        .toLowerCase(),
      name = String(body.name || "").trim();
    if (!name || name.length > 100 || !email)
      throw new Error("Enter a name and email address.");
    const existing =
      state.accounts.find((a) => a.email.toLowerCase() === email) ||
      demoAccounts.find((a) => a.email === email);
    const mapping = { ...existing, name, email, role: body.role };
    delete mapping.password;
    state.accounts = state.accounts.filter(
      (a) => a.email.toLowerCase() !== email,
    );
    state.accounts.push(mapping);
    if (
      existing?.id &&
      (existing.role === "student" || state.profiles?.[existing.id])
    ) {
      state.profiles = {
        ...state.profiles,
        [existing.id]: {
          ...state.profiles?.[existing.id],
          name,
          number:
            existing.studentId || state.profiles?.[existing.id]?.number || "",
          course: state.profiles?.[existing.id]?.course || "",
        },
      };
      state.bookings = state.bookings.map((b) =>
        b.studentId === existing.id ? { ...b, studentName: name } : b,
      );
    }
    save(state);
    return { ok: true };
  }
  throw new Error("This action is not part of the UI demo.");
}
export function post(path, body) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}
export const dateLabel = (value, long = false) =>
  value
    ? new Intl.DateTimeFormat("en-PH", {
        month: long ? "long" : "short",
        day: "numeric",
        year: "numeric",
        ...(long ? { weekday: "long" } : {}),
      }).format(new Date(value + "T12:00:00+08:00"))
    : "Choose a date";
export const timeLabel = (value) => {
  if (!value) return "Choose a time";
  const [h, m] = value.split(":").map(Number),
    end = (h + 1) % 24;
  const format = (hour) =>
    `${hour % 12 || 12}:${String(m).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
  const from = format(h),
    to = format(end);
  return `${h < 12 === end < 12 ? from.slice(0, -3) : from}–${to}`;
};
export const officeName = (id) => (id === "cashier" ? "Cashier" : "Accounting");
export const serviceName = (data, officeId, serviceId) =>
  (Array.isArray(serviceId) ? serviceId : [serviceId])
    .map(
      (id) =>
        data.offices
          .find((o) => o.id === officeId)
          ?.services.find((s) => s.id === id)?.name || id,
    )
    .filter(Boolean)
    .join(", ");

export const manilaDate = (now = Date.now()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
 
export function appointmentPassed(booking, now = Date.now()) {
  return (
    booking.status === "booked" &&
    new Date(booking.date + "T" + booking.time + ":00+08:00").getTime() +
      3600000 <=
      now
  );
}
export function reservationState(booking, now = Date.now()) {
  if (appointmentPassed(booking, now)) return "passed";
  if (booking.status === "booked") return "booked";
  return booking.status;
}
export function reservationLabel(booking, now = Date.now()) {
  return (
    {
      booked: "Reserved",
      waiting: "Waiting",
      "checked-in": "Being served",
      completed: "Completed",
      cancelled: "Cancelled",
      passed: "Appointment passed",
    }[reservationState(booking, now)] || booking.status
  );
}

export function appointmentIsCurrent(booking,now=Date.now()){const start=Date.parse(booking.date+'T'+booking.time+':00+08:00');return Number.isFinite(start)&&now>=start&&now<start+3600000;}

import React from "react";
import { Users, Clock } from "lucide-react";
import { appointmentPassed, manilaDate, reservationLabel } from "../appointmentStatus.js";
import { dateLabel } from "../api.js";
export default function QueueProgress({ booking, data }) {
 const today=manilaDate();
 const serving=booking.status === "checked-in";
 const closed=["completed","cancelled"].includes(booking.status);
 return <section className="ticket-queue-progress" aria-label="Your service status">
   <h3><Users size={18}/>Your service status · {reservationLabel(booking)}</h3>
   <p>{closed ? (booking.status === "completed" ? "Your visit is complete. Keep this ticket for your records." : "This reservation is cancelled.")
     : serving ? "The office has admitted your ticket at the counter. Your payment or requested service is being handled."
     : booking.date > today ? "Reserved for " + dateLabel(booking.date) + ". On your appointment date, join the physical line and present your ticket when you reach the counter."
     : appointmentPassed(booking) || booking.date < today ? "Your appointment date or window has passed. Contact the office about your visit."
     : "Join the physical line at your appointment time. Present your QR ticket when you reach the counter. Staff will admit your ticket and begin your service."}</p>
   {!closed && !serving && <p className="ticket-queue-footnote">Waiting takes place in the physical line. This app does not track your arrival or how many students are ahead of you. Your ticket stays Reserved until staff admits it at the counter.</p>}
   <small><Clock size={13}/>Service status · Refreshes every 3 seconds in this browser{data.queueUpdatedAt ? " · Updated " + new Date(data.queueUpdatedAt).toLocaleTimeString("en-PH",{timeZone:"Asia/Manila"}) : ""}</small>
 </section>;
}

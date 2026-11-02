// User-requested removal of the known demo visit completed before its appointment.
export function removeInvalidDemoReservation(state){
 if(state.invalidNov3ClearanceRemoved)return false;
 const matches=b=>b.studentId==='student'&&b.officeId==='accounting'&&b.date==='2026-11-03'&&b.time==='09:00'&&b.status==='completed'&&(b.serviceIds||[b.serviceId]).includes('clearance');
 const records=state.bookings.filter(matches);
 state.removedInvalidReservations=[...(state.removedInvalidReservations||[]),...records.map(booking=>({booking,removedAt:new Date().toISOString(),reason:'User requested removal of the invalid demo clearance visit marked completed before its scheduled date.'}))];
 state.bookings=state.bookings.filter(b=>!matches(b));
 state.invalidNov3ClearanceRemoved={removedCount:records.length};
 return true;
}

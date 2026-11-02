// One-time cleanup of reservations created before the daily booking limit.
export function cleanLegacyBookings(state) {
 if(state.dailyBookingCleanupV1)return false;
 const seen=new Map(),removed=new Set();
 const ordered=[...state.bookings].sort((a,b)=>String(a.createdAt||`${a.date}T${a.time}`).localeCompare(String(b.createdAt||`${b.date}T${b.time}`)));
 for(const booking of ordered){
  if(booking.status==='cancelled'||booking.exception||booking.type==='walk-in')continue;
  const account=state.accounts?.find(a=>a.id===booking.studentId||a.studentId&&a.studentId===booking.studentNumber);
  const identity=account?.id||booking.studentId||booking.studentNumber;
  if(!identity)continue;
  const key=JSON.stringify([identity,booking.officeId,booking.date]);
  if(seen.has(key))removed.add(booking.id);else seen.set(key,booking.id);
 }
 const at=new Date().toISOString();
 state.removedDuplicateBookings=[...(state.removedDuplicateBookings||[]),...state.bookings.filter(b=>removed.has(b.id)).map(booking=>({booking,removedAt:at,reason:'Duplicate booking for the same student, office and day.'}))];
 state.bookings=state.bookings.filter(b=>!removed.has(b.id));
 state.dailyBookingCleanupV1={at,removedCount:removed.size};
 return true;
}

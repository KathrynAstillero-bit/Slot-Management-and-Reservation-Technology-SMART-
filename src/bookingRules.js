export const DAILY_OFFICE_BOOKING_LIMIT=2;
export const BOOKING_POLICY='Up to two bookings per student per office per day. One appointment per hour across all offices. Combine services into one ticket. Cancel or reschedule from My reservations.';

export function bookingConflict(bookings, candidate, {excludeId, allowReturn=false}={}) {
 const visits=bookings.filter(b=>b.id!==excludeId&&b.status!=='cancelled'&&(
  b.studentId&&b.studentId===candidate.studentId||candidate.studentNumber&&b.studentNumber===candidate.studentNumber));
 if(visits.some(b=>b.date===candidate.date&&b.time===candidate.time))return 'You already have an appointment during this hour. Choose another hour.';
 if(!allowReturn&&visits.filter(b=>b.officeId===candidate.officeId&&b.date===candidate.date).length>=DAILY_OFFICE_BOOKING_LIMIT)return 'Only two bookings per student per office per day are allowed. Reschedule your existing reservation or contact the office for a return visit.';
 return '';
}

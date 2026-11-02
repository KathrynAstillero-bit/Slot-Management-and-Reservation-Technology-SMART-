export const reservationSortOptions=[
 ['appointment-oldest','Oldest'],
 ['appointment-latest','Most recent'],
];
export function compareReservations(order,a,b){
 const text=(a,b)=>String(a||'').localeCompare(String(b||''),undefined,{numeric:true});
 const schedule=text(a.date,b.date)||text(a.time,b.time);
 const tie=()=>schedule||text(a.officeId,b.officeId)||text(a.queueNumber,b.queueNumber)||text(a.id,b.id);
 if(order==='appointment-latest')return -schedule||tie();
 if(order==='queue')return text(a.queueNumber,b.queueNumber)||tie();
 if(order==='booked-newest'||order==='booked-oldest'){
  const left=Date.parse(a.createdAt),right=Date.parse(b.createdAt);
  if(Number.isFinite(left)!==Number.isFinite(right))return Number.isFinite(left)?-1:1;
  if(Number.isFinite(left)&&left!==right)return order==='booked-newest'?right-left:left-right;
 }
 return tie();
}

// Sort admitted tickets for the counter service summary; this is not physical line order.
export function queueOrder(a,b) {
 return (a.checkedInAt || a.createdAt || "").localeCompare(b.checkedInAt || b.createdAt || "") || a.queueNumber.localeCompare(b.queueNumber);
}

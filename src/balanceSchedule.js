export const paymentPeriods = [
  "Upon registration",
  "Prelim",
  "Midterm",
  "Semi-final",
  "Final",
];

// Integer centavos keep assessment and payment totals exact.
export function buildAssessment(discountPercent = 0) {
  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  )
    throw new RangeError("Tuition discount must be between 0 and 100.");
  const tuition = Math.round((764400 * (100 - discountPercent)) / 100);
  const laboratory = 556800,
    miscellaneous = 470000;
  const base = tuition + laboratory;
  const installments = [0.3, 0.3, 0.25].map((portion) =>
    Math.round(base * portion),
  );
  installments.push(
    base - installments.reduce((sum, amount) => sum + amount, 0),
  );
  return {
    tuition,
    laboratory,
    miscellaneous,
    total: tuition + laboratory + miscellaneous,
    schedule: [miscellaneous, ...installments],
  };
}
export function summarizeBalance(assessment, paidAmounts, currentPeriod) {
  const rows = assessment.schedule.map((amount, index) => {
    const paid = Math.max(
      0,
      Math.min(amount, Math.round(paidAmounts[index] || 0)),
    );
    const remaining = amount - paid;
    return {
      label: paymentPeriods[index],
      amount,
      paid,
      remaining,
      status:
        remaining === 0 ? "paid" : index <= currentPeriod ? "due" : "upcoming",
    };
  });
  return {
    rows,
    paid: rows.reduce((sum, row) => sum + row.paid, 0),
    remaining: rows.reduce((sum, row) => sum + row.remaining, 0),
    due: rows
      .filter((row) => row.status === "due")
      .reduce((sum, row) => sum + row.remaining, 0),
  };
}
export const peso = (centavos) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    centavos / 100,
  );

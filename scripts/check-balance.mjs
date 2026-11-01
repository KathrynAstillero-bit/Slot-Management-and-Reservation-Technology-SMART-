import assert from "node:assert/strict";
import { buildAssessment, summarizeBalance } from "../src/balanceSchedule.js";
const regular = buildAssessment();
assert.equal(regular.total, 1791200);
assert.deepEqual(regular.schedule, [470000, 396360, 396360, 330300, 198180]);
const discounted = buildAssessment(40);
assert.equal(discounted.total, 1485440);
assert.deepEqual(discounted.schedule, [470000, 304632, 304632, 253860, 152316]);
for (const assessment of [regular, discounted]) {
  assert.equal(
    assessment.schedule.reduce((sum, amount) => sum + amount, 0),
    assessment.total,
  );
  const due = summarizeBalance(assessment, [], 2);
  assert.deepEqual(
    due.rows.map((row) => row.status),
    ["due", "due", "due", "upcoming", "upcoming"],
  );
  assert.equal(
    due.due,
    assessment.schedule.slice(0, 3).reduce((sum, amount) => sum + amount, 0),
  );
  const paid = summarizeBalance(assessment, assessment.schedule, 2);
  assert.equal(paid.remaining, 0);
  assert.equal(paid.due, 0);
  assert.ok(paid.rows.every((row) => row.status === "paid"));
  const partial = summarizeBalance(assessment, [470000, 100000], 2);
  assert.equal(partial.rows[0].status, "paid");
  assert.equal(partial.rows[1].remaining, assessment.schedule[1] - 100000);
  assert.equal(partial.remaining, assessment.total - 570000);
  assert.equal(summarizeBalance(assessment, [], 0).due, 470000);
  assert.equal(summarizeBalance(assessment, [], 4).due, assessment.total);
}
console.log(
  "Balance checks passed: both assessments, period cutoffs, partial payments, fully paid, exact totals.",
);

for (let rate = 10; rate <= 100; rate += 10) {
  const a = buildAssessment(rate);
  assert.equal(a.tuition, Math.round((764400 * (100 - rate)) / 100));
  assert.equal(a.laboratory, 556800);
  assert.equal(a.miscellaneous, 470000);
  assert.equal(
    a.schedule.reduce((x, y) => x + y, 0),
    a.total,
  );
  const paid = summarizeBalance(a, a.schedule, 2);
  assert.equal(paid.remaining, 0);
}
assert.equal(buildAssessment(100).tuition, 0);
assert.equal(buildAssessment(100).total, 1026800);
assert.throws(() => buildAssessment(101), RangeError);
assert.throws(() => buildAssessment(-1), RangeError);
console.log(
  "Discount checks passed for 10–100% tuition discounts and exact fee totals.",
);

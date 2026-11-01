import React from "react";
import { Info } from "lucide-react";
export default function PriorityNotice() {
  return (
    <aside
      className="notice info priority-notice"
      aria-label="Office closure and priority policy"
    >
      <Info size={20} aria-hidden="true" />
      <div className="priority-notice-copy">
        <h3>Office closures &amp; emergencies</h3>
        <p>
          If an office closure affects your booked slot, your priority is
          retained.
        </p>
        <ul>
          <li>
            <strong>When service resumes:</strong> Affected students are served
            in their original queue order.
          </li>
          <li>
            <strong>If the office stays closed:</strong> Contact the office for
            priority rescheduling.
          </li>
          <li>
            <strong>If the new schedule does not suit you:</strong> Choose
            another available slot.
          </li>
        </ul>
      </div>
    </aside>
  );
}

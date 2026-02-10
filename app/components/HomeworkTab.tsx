"use client";

import type { HomeworkTabProps } from "../lib/types";
import { formatDate, formatFullDate } from "../lib/time-utils";



export default function HomeworkTab({
  items,
  onMarkDone,
  onOpenSession,
}: HomeworkTabProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Homework</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
            Pending
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300/70">
          From attendance records. Mark items done after you submit.
        </p>

        <div className="mt-5 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400/70">
              No pending homework right now.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-(--panel-strong) p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                      {item.dueDate
                        ? `Due ${formatDate(item.dueDate)}`
                        : "Due date not set"}
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {item.subjectName}
                    </p>
                    <p className="mt-1 text-xs text-slate-300/70">
                      Assigned {formatFullDate(item.assignedDate)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onMarkDone(item.record)}
                    className="rounded-full border border-emerald-400/50 bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
                  >
                    Mark done
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-200/80">{item.text}</p>
                <button
                  type="button"
                  onClick={() => onOpenSession(item.record)}
                  className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-300/70"
                >
                  Open session
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

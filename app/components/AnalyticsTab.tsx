"use client";

import { formatPercent } from "../lib/time-utils";
import type { AnalyticsTabProps } from "../lib/types";


export default function AnalyticsTab({
  attendanceSummary,
  attendanceTargetPercent,
  onTargetChange,
}: AnalyticsTabProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Analytics</h2>
            <p className="mt-2 text-sm text-slate-300/70">
              Subject-wise attendance summaries based on session records.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3">
            <label
              htmlFor="attendance-target"
              className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70"
            >
              Target %
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="attendance-target"
                type="number"
                min={50}
                max={100}
                value={attendanceTargetPercent}
                onChange={(event) => {
                  const next = Math.min(
                    100,
                    Math.max(50, Number(event.target.value || 0)),
                  );
                  onTargetChange(Number.isNaN(next) ? 75 : next);
                }}
                className="w-20 rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
              />
              <span className="text-sm text-slate-300/70">%</span>
            </div>
          </div>
        </div>
      </div>

      {attendanceSummary.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6 text-sm text-slate-400/70">
          No attendance records yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {attendanceSummary.map((summary) => {
            const riskStyle =
              summary.risk === "safe"
                ? "border-emerald-400/40 text-emerald-100"
                : summary.risk === "at-risk"
                  ? "border-amber-400/50 text-amber-100"
                  : "border-rose-400/50 text-rose-100";

            return (
              <div
                key={summary.subjectId}
                className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {summary.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300/70">
                      Total classes (holidays excluded): {summary.total}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${riskStyle}`}
                  >
                    {summary.risk.replace("-", " ")}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">
                      Attended
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {summary.attended}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">
                      Total (no bunks)
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {summary.totalNoBunk}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">
                      Attendance (with bunks)
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatPercent(summary.percent)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">
                      Attendance (no bunks)
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {summary.totalNoBunk > 0
                        ? formatPercent(summary.attended / summary.totalNoBunk)
                        : "0%"}
                    </p>
                  </div>
                </div>

                {summary.required > 0 ? (
                  <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                    Needs {summary.required} more consecutive classes to reach{" "}
                    {attendanceTargetPercent}%.
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    On track for {attendanceTargetPercent}%.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

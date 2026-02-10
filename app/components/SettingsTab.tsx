"use client";

import type { SettingsTabProps } from "../lib/types";
import { WEEK_CONFIGS } from "../lib/ui-data";



export default function SettingsTab({
  attendanceTargetPercent,
  onTargetChange,
  weekConfig,
  onWeekConfigChange,
  onExport,
  onImportClick,
  onImportChange,
  fileInputRef,
  importError,
  onClearAll,
}: SettingsTabProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
            Local only
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300/70">
          Manage attendance targets, week layout, and backups.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200/80">
            Attendance target
          </h3>
          <div className="mt-4 flex items-center gap-3">
            <input
              id="settings-attendance-target"
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
              aria-label="Attendance target percentage"
              className="w-24 rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
            />
            <span className="text-sm text-slate-300/70">%</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200/80">
            Week configuration
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {WEEK_CONFIGS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onWeekConfigChange(option.id)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  weekConfig === option.id
                    ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-100"
                    : "border-white/10 text-slate-300/70"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200/80">
          Backup
        </h3>
        <p className="mt-2 text-sm text-slate-300/70">
          Export or import all local data as JSON.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onExport}
            className="rounded-full border border-emerald-400/50 bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
          >
            Export data
          </button>
          <button
            type="button"
            onClick={onImportClick}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70"
          >
            Import data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={onImportChange}
            aria-label="Import data file"
            className="hidden"
          />
        </div>
        {importError ? (
          <p className="mt-3 text-sm text-rose-200/80">{importError}</p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-100">
          Clear local data
        </h3>
        <p className="mt-2 text-sm text-rose-100/80">
          Deletes subjects, timetable blocks, and attendance records.
        </p>
        <button
          type="button"
          onClick={onClearAll}
          className="mt-4 rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100"
        >
          Clear all data
        </button>
      </div>
    </section>
  );
}

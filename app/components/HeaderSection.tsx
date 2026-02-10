"use client";

import type { HeaderSectionProps } from "../lib/types";



export default function HeaderSection({
  online,
  installReady,
  savedAt,
  blocksCount,
  subjectsCount,
  onInstall,
}: HeaderSectionProps) {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-(--panel)/80 p-6 shadow-2xl shadow-black/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">
            Semester Setup
          </p>
          <h1 className="text-3xl text-white sm:text-4xl font-(--font-display)">
            Academic Index
          </h1>
          <p className="max-w-xl text-sm text-slate-200/80">
            Add every subject once, set how many classes you have each week,
            then drag those blocks into the timetable grid. Save it and use it
            all semester.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
              online
                ? "border-emerald-400/40 text-emerald-200"
                : "border-rose-400/40 text-rose-200"
            }`}
          >
            {online ? "Online" : "Offline"}
          </span>
          <button
            type="button"
            onClick={onInstall}
            disabled={!installReady}
            className="rounded-full border border-emerald-400/40 bg-emerald-400/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {installReady ? "Install App" : "Install Ready"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-(--panel-strong) p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
            Sessions Placed
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {blocksCount}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-(--panel-strong) p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
            Subjects
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {subjectsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-(--panel-strong) p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
            Save Status
          </p>
          <p className="mt-2 text-sm text-slate-200/80">
            {savedAt
              ? `Saved ${new Date(savedAt).toLocaleTimeString()}`
              : "Not saved yet"}
          </p>
        </div>
      </div>
    </header>
  );
}

"use client";

import type { NotesTabProps } from "../lib/types";
import { formatFullDate } from "../lib/time-utils";



export default function NotesTab({
  notesBySubject,
  onOpenSession,
}: NotesTabProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Notes</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
            By subject
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300/70">
          Notes are pulled from attendance records. Tap to view or edit in the
          session modal.
        </p>
      </div>

      {notesBySubject.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6 text-sm text-slate-400/70">
          No notes yet.
        </div>
      ) : (
        notesBySubject.map((group) => (
          <div
            key={group.subjectId}
            className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {group.subjectName}
              </h3>
              <span className="text-xs text-slate-300/70">
                {group.records.length} notes
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {group.records.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => onOpenSession(record)}
                  className="w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-left transition hover:border-emerald-400/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                      {formatFullDate(record.date)}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400/70">
                      Tap to edit
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-200/80">
                    {record.notes}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

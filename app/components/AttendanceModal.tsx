"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  AttendanceFormState,
  AttendanceStatus,
  Subject,
  TimeBlock,
} from "../lib/types";
import { ATTENDANCE_STYLES } from "../lib/ui-data";

type AttendanceModalProps = {
  activeSession: TimeBlock | null;
  subjectLookup: Map<string, Subject>;
  attendanceForm: AttendanceFormState;
  setAttendanceForm: Dispatch<SetStateAction<AttendanceFormState>>;
  attendanceIsFuture: boolean;
  onSave: () => void;
  onClose: () => void;
};

export default function AttendanceModal({
  activeSession,
  subjectLookup,
  attendanceForm,
  setAttendanceForm,
  attendanceIsFuture,
  onSave,
  onClose,
}: AttendanceModalProps) {
  if (!activeSession) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 py-4 sm:items-center sm:px-4 sm:py-6">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-(--panel)/95 p-4 shadow-2xl shadow-black/40 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
              Attendance
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {activeSession.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300/80">
              {activeSession.day} · {activeSession.start} - {activeSession.end}
              {activeSession.subjectId &&
              subjectLookup.get(activeSession.subjectId)?.room
                ? ` · ${subjectLookup.get(activeSession.subjectId)?.room}`
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="attendance-date-modal"
              className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
            >
              Session date
            </label>
            <input
              id="attendance-date-modal"
              type="date"
              value={attendanceForm.date}
              onChange={(event) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  date: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
            />
            {attendanceIsFuture ? (
              <p className="mt-2 text-xs text-amber-200/80">
                Attendance can only be marked on or before today.
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
              Status
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(ATTENDANCE_STYLES) as AttendanceStatus[]).map(
                (status) => {
                  const style = ATTENDANCE_STYLES[status];
                  const isActive = attendanceForm.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={attendanceIsFuture}
                      onClick={() =>
                        setAttendanceForm((prev) => ({
                          ...prev,
                          status,
                        }))
                      }
                      className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${
                        isActive
                          ? `border-white/20 ${style.pill}`
                          : "border-white/10 text-slate-300/70"
                      } ${attendanceIsFuture ? "opacity-50" : ""}`}
                    >
                      {style.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm text-slate-200/80">
            <input
              type="checkbox"
              checked={attendanceForm.teacherPresent}
              disabled={attendanceIsFuture}
              onChange={(event) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  teacherPresent: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-white/10 bg-(--panel-strong)"
            />
            Teacher present
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="attendance-homework-submitted"
              className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
            >
              Homework submitted
            </label>
            <textarea
              id="attendance-homework-submitted"
              value={attendanceForm.homeworkSubmitted}
              disabled={attendanceIsFuture}
              onChange={(event) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  homeworkSubmitted: event.target.value,
                }))
              }
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="attendance-homework-next"
              className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
            >
              Homework for next class
            </label>
            <textarea
              id="attendance-homework-next"
              value={attendanceForm.homeworkNext}
              disabled={attendanceIsFuture}
              onChange={(event) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  homeworkNext: event.target.value,
                }))
              }
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
            />
            <label
              htmlFor="attendance-homework-due"
              className="mt-3 block text-xs uppercase tracking-[0.3em] text-slate-300/70"
            >
              Due date
            </label>
            <input
              id="attendance-homework-due"
              type="date"
              value={attendanceForm.homeworkDueDate}
              onChange={(event) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  homeworkDueDate: event.target.value,
                }))
              }
              disabled={
                attendanceIsFuture || !attendanceForm.homeworkNext.trim()
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="attendance-notes"
            className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
          >
            Notes
          </label>
          <textarea
            id="attendance-notes"
            value={attendanceForm.notes}
            disabled={attendanceIsFuture}
            onChange={(event) =>
              setAttendanceForm((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
            rows={3}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={attendanceIsFuture}
            className="rounded-full border border-emerald-400/50 bg-emerald-400/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
          >
            Save attendance
          </button>
        </div>
      </div>
    </div>
  );
}

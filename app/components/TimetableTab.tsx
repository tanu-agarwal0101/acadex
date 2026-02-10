"use client";

import type { ChangeEvent, DragEvent, FormEvent } from "react";
import type {
  AttendanceRecord,
  ColorKey,
  DayGridClasses,
  DayLabel,
  Subject,
  SubjectFormState,
  TimeBlock,
  TimeSlot,
} from "../lib/types";
import {
  ATTENDANCE_STYLES,
  COLOR_STYLES,
  DAY_COL_START,
  MAX_TIME_SLOTS,
  ROW_START,
} from "../lib/ui-data";
import { formatDate, formatHours, getDayLabel } from "../lib/time-utils";

const DAY_ORDER: DayLabel[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type TimetableTabProps = {
  subjectForm: SubjectFormState;
  error: string | null;
  subjects: Subject[];
  subjectUsage: Map<string, number>;
  onSubjectChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onAddSubject: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveSubject: (subjectId: string) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnd: () => void;
  breakSlotLabel: string;
  onBreakSlotChange: (value: string) => void;
  attendanceDate: string;
  onAttendanceDateChange: (value: string) => void;
  onMarkTodayPresent: () => void;
  showTimingEditor: boolean;
  timeSlots: TimeSlot[];
  timeSlotDrafts: TimeSlot[];
  timeSlotError: string | null;
  onToggleTimingEditor: () => void;
  onTimeSlotChange: (
    index: number,
    field: "start" | "end",
    value: string,
  ) => void;
  onAddTimeSlot: () => void;
  onRemoveTimeSlot: (index: number) => void;
  onSaveTimeSlots: () => void;
  visibleDays: DayLabel[];
  mobileDay: DayLabel;
  onMobileDayChange: (day: DayLabel) => void;
  dayGridClasses: DayGridClasses;
  blockLookup: Map<string, TimeBlock[]>;
  dragSubjectId: string | null;
  isLabContinuation: (day: DayLabel, slotIndex: number) => boolean;
  isLabStart: (block: TimeBlock, day: DayLabel, slotIndex: number) => boolean;
  getSlotKey: (day: DayLabel, slot: TimeSlot) => string;
  onDrop: (
    event: DragEvent<HTMLDivElement>,
    day: DayLabel,
    slotIndex: number,
  ) => void;
  onOpenAttendanceModal: (block: TimeBlock) => void;
  onRemoveBlock: (blockId: string) => void;
  attendanceByKey: Map<string, AttendanceRecord>;
  getAttendanceKey: (
    date: string,
    block: Pick<TimeBlock, "subjectId" | "day" | "start" | "end">,
  ) => string;
  totalMinutes: number;
  onSaveTimetable: () => void;
};

export default function TimetableTab({
  subjectForm,
  error,
  subjects,
  subjectUsage,
  onSubjectChange,
  onAddSubject,
  onRemoveSubject,
  onDragStart,
  onDragEnd,
  breakSlotLabel,
  onBreakSlotChange,
  attendanceDate,
  onAttendanceDateChange,
  onMarkTodayPresent,
  showTimingEditor,
  timeSlots,
  timeSlotDrafts,
  timeSlotError,
  onToggleTimingEditor,
  onTimeSlotChange,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onSaveTimeSlots,
  visibleDays,
  mobileDay,
  onMobileDayChange,
  dayGridClasses,
  blockLookup,
  dragSubjectId,
  isLabContinuation,
  isLabStart,
  getSlotKey,
  onDrop,
  onOpenAttendanceModal,
  onRemoveBlock,
  attendanceByKey,
  getAttendanceKey,
  totalMinutes,
  onSaveTimetable,
}: TimetableTabProps) {
  const selectedDate = new Date(`${attendanceDate}T00:00:00`);
  const selectedDayLabel = getDayLabel(selectedDate);
  const weekStartLabel = visibleDays[0];
  const weekStartIndex = DAY_ORDER.indexOf(weekStartLabel);
  const selectedIndex = DAY_ORDER.indexOf(selectedDayLabel);
  const startOffset = (selectedIndex - weekStartIndex + 7) % 7;
  const weekStartDate = new Date(selectedDate);
  weekStartDate.setDate(selectedDate.getDate() - startOffset);

  const formatDayDate = (day: DayLabel) => {
    const dayIndex = DAY_ORDER.indexOf(day);
    if (dayIndex === -1 || weekStartIndex === -1) {
      return "";
    }
    const offset = (dayIndex - weekStartIndex + 7) % 7;
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(date.getDate()).padStart(2, "0");
    return formatDate(`${year}-${month}-${dayOfMonth}`);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="min-w-0 space-y-6">
        <form
          className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6"
          onSubmit={onAddSubject}
        >
          <h2 className="text-lg font-semibold text-white">Add subjects</h2>
          <p className="mt-2 text-sm text-slate-300/70">
            Tell us the subject details and how many classes you have each week.
            You will place that many blocks on the timetable.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="subject-name"
                className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
              >
                Subject name
              </label>
              <input
                id="subject-name"
                name="name"
                value={subjectForm.name}
                onChange={onSubjectChange}
                placeholder="Compiler Design"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="subject-code"
                  className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
                >
                  Subject code
                </label>
                <input
                  id="subject-code"
                  name="code"
                  value={subjectForm.code}
                  onChange={onSubjectChange}
                  placeholder="BCS-602"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="subject-instructor"
                  className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
                >
                  Instructor
                </label>
                <input
                  id="subject-instructor"
                  name="instructor"
                  value={subjectForm.instructor}
                  onChange={onSubjectChange}
                  placeholder="Dr. Sharma"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="subject-room"
                  className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
                >
                  Room / Lab
                </label>
                <input
                  id="subject-room"
                  name="room"
                  value={subjectForm.room}
                  onChange={onSubjectChange}
                  placeholder="AB-1 304"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="subject-type"
                  className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
                >
                  Type
                </label>
                <select
                  id="subject-type"
                  name="type"
                  value={subjectForm.type}
                  onChange={onSubjectChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
                >
                  <option value="lecture">Lecture (1 slot)</option>
                  <option value="lab">Lab (2 slots)</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="subject-sessions"
                  className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
                >
                  Sessions per week
                </label>
                <input
                  id="subject-sessions"
                  name="sessionsPerWeek"
                  type="number"
                  min={1}
                  value={subjectForm.sessionsPerWeek}
                  onChange={onSubjectChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="subject-color"
                  className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
                >
                  Color
                </label>
                <select
                  id="subject-color"
                  name="color"
                  value={subjectForm.color}
                  onChange={onSubjectChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
                >
                  {(Object.keys(COLOR_STYLES) as ColorKey[]).map((key) => (
                    <option key={key} value={key}>
                      {COLOR_STYLES[key].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error ? (
              <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-(--accent-ink) transition hover:brightness-110"
            >
              Add subject
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Subject stack</h2>
            <span className="text-xs text-slate-300/60">Drag into grid</span>
          </div>
          <p className="mt-2 text-sm text-slate-300/70">
            Drag each subject onto the timetable until its required number of
            blocks is placed.
          </p>

          <div className="mt-4 space-y-3">
            {subjects.length === 0 ? (
              <p className="text-sm text-slate-400/70">
                Add your subjects to begin.
              </p>
            ) : (
              subjects.map((subject) => {
                const styles = COLOR_STYLES[subject.color];
                const used = subjectUsage.get(subject.id) ?? 0;
                const remaining = Math.max(0, subject.sessionsPerWeek - used);
                return (
                  <div
                    key={subject.id}
                    draggable={remaining > 0}
                    onDragStart={(event) => onDragStart(event, subject.id)}
                    onDragEnd={onDragEnd}
                    className={`rounded-2xl border bg-(--panel-strong) p-4 transition ${
                      remaining > 0
                        ? "border-white/10 hover:border-emerald-400/40"
                        : "border-white/5 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${styles.dot}`}
                        />
                        <span className="text-sm font-semibold text-white">
                          {subject.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-300/70">
                        {used}/{subject.sessionsPerWeek} placed
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-300/70">
                      {subject.code ? `${subject.code} · ` : ""}
                      {subject.type === "lab" ? "Lab" : "Lecture"}
                      {subject.room ? ` · ${subject.room}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 ${styles.pill}`}
                      >
                        {styles.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                            remaining > 0
                              ? "border-emerald-400/50 text-emerald-200"
                              : "border-white/10 text-slate-300/40"
                          }`}
                        >
                          Drag me
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveSubject(subject.id)}
                          className="uppercase tracking-[0.2em] text-rose-200/80"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-3xl border border-white/10 bg-(--panel)/80 p-3 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Weekly timetable</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
            Place blocks
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div>
            <label
              htmlFor="break-slot"
              className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
            >
              Break slot
            </label>
            <select
              id="break-slot"
              value={breakSlotLabel}
              onChange={(event) => onBreakSlotChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
            >
              {timeSlots.map((slot) => (
                <option key={slot.label} value={slot.label}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="attendance-date"
              className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
            >
              Session date
            </label>
            <input
              id="attendance-date"
              type="date"
              value={attendanceDate}
              onChange={(event) => onAttendanceDateChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
            />
          </div>
          <div className="rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3 text-xs text-slate-300/70">
            Labs take two consecutive slots. Drag a lab onto the first slot to
            stretch it.
          </div>
          <button
            type="button"
            onClick={onMarkTodayPresent}
            className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100"
          >
            Mark today present
          </button>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-(--panel-strong) p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                Time slots
              </div>
              <p className="mt-1 text-xs text-slate-300/70">
                Edit start and end times. Labels update automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTimingEditor}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/80"
            >
              {showTimingEditor ? "Close" : "Change timings"}
            </button>
          </div>
          {showTimingEditor ? (
            <div className="mt-4 space-y-2">
              {timeSlotDrafts.map((slot, slotIndex) => (
                <div
                  key={`${slot.start}-${slot.end}-${slotIndex}`}
                  className="grid gap-2 rounded-2xl border border-white/10 bg-(--panel) p-3 sm:grid-cols-[110px_110px_110px_auto] sm:items-center"
                >
                  <div className="text-xs font-semibold text-slate-100">
                    {slot.label}
                  </div>
                  <label className="text-xs text-slate-300/70">
                    <span className="sr-only">Start time</span>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(event) =>
                        onTimeSlotChange(slotIndex, "start", event.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs text-slate-300/70">
                    <span className="sr-only">End time</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(event) =>
                        onTimeSlotChange(slotIndex, "end", event.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onRemoveTimeSlot(slotIndex)}
                    disabled={timeSlotDrafts.length <= 1}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-rose-200/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {timeSlotError ? (
                <p className="text-xs text-rose-200/80">{timeSlotError}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onAddTimeSlot}
                  disabled={timeSlotDrafts.length >= MAX_TIME_SLOTS}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add slot
                </button>
                <span className="text-xs text-slate-300/70">
                  {timeSlotDrafts.length}/{MAX_TIME_SLOTS} slots
                </span>
                <div className="ml-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSaveTimeSlots}
                    className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100"
                  >
                    Save timings
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200/80">
              {timeSlots.map((slot) => (
                <span
                  key={slot.label}
                  className="rounded-full border border-white/10 bg-(--panel) px-3 py-1"
                >
                  {slot.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="sm:hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {visibleDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => onMobileDayChange(day)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                    mobileDay === day
                      ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-100"
                      : "border-white/10 text-slate-300/70"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{day}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">
                      {formatDayDate(day)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-1 grid-cols-[60px_minmax(0,1fr)] auto-rows-[72px]">
              {timeSlots.map((slot, slotIndex) => {
                const isBreak = slot.label === breakSlotLabel;
                return (
                  <div key={slot.label} className="contents">
                    <div
                      className={`rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-xs text-slate-200/80 col-start-1 ${ROW_START[slotIndex]}`}
                    >
                      {slot.label}
                    </div>
                    {isBreak ? (
                      <div
                        className={`flex min-h-16 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-xs uppercase tracking-[0.3em] text-amber-100 col-start-2 ${ROW_START[slotIndex]}`}
                      >
                        Break
                      </div>
                    ) : isLabContinuation(mobileDay, slotIndex) ? null : (
                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => onDrop(event, mobileDay, slotIndex)}
                        className={`rounded-xl border border-dashed px-2 py-2 text-left transition ${
                          dragSubjectId
                            ? "border-emerald-400/40 bg-emerald-400/5"
                            : "border-white/10 bg-(--panel-strong)"
                        } col-start-2 ${ROW_START[slotIndex]} ${(() => {
                          const key = getSlotKey(mobileDay, slot);
                          const cellBlocks = blockLookup.get(key) ?? [];
                          const mainBlock = cellBlocks[0];
                          const mergeLab =
                            mainBlock && cellBlocks.length === 1
                              ? isLabStart(mainBlock, mobileDay, slotIndex)
                              : false;
                          return mergeLab ? "row-span-2" : "";
                        })()}`}
                      >
                        {(() => {
                          const key = getSlotKey(mobileDay, slot);
                          const cellBlocks = blockLookup.get(key) ?? [];
                          if (cellBlocks.length === 0) {
                            return (
                              <span className="text-xs text-slate-400/70">
                                Drop here
                              </span>
                            );
                          }
                          return cellBlocks.map((block) => {
                            const styles = COLOR_STYLES[block.color];
                            const attendance = block.subjectId
                              ? attendanceByKey.get(
                                  getAttendanceKey(attendanceDate, block),
                                )
                              : undefined;
                            const statusStyle = attendance
                              ? ATTENDANCE_STYLES[attendance.status]
                              : null;
                            return (
                              <div
                                key={block.id}
                                onClick={() => onOpenAttendanceModal(block)}
                                className={`mb-1 cursor-pointer rounded-xl border px-2 py-1.5 text-[12px] leading-snug shadow-sm shadow-black/30 wrap-break-word ${
                                  statusStyle
                                    ? `ring-1 ring-inset ${statusStyle.ring}`
                                    : ""
                                } ${styles.badge}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-white">
                                    {block.title}
                                  </span>
                                  {statusStyle ? (
                                    <span
                                      className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`}
                                    />
                                  ) : null}
                                  {block.part !== 2 ? (
                                    <button
                                      type="button"
                                      aria-label="Remove block"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        onRemoveBlock(block.id);
                                      }}
                                      className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-400/40 bg-rose-400/10 text-base font-semibold text-rose-100/90 transition hover:bg-rose-400/20"
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      }
                                    >
                                      ×
                                    </button>
                                  ) : null}
                                </div>
                                {block.part === 2 ? (
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-200/70">
                                    Continues
                                  </p>
                                ) : null}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden overflow-x-auto pb-2 sm:block">
            <div className="min-w-0 w-full">
              <div
                className={`grid w-full gap-1 ${dayGridClasses.cols} ${dayGridClasses.colsSm} ${dayGridClasses.colsLg}`}
              >
                <div className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                  Time
                </div>
                {visibleDays.map((day) => (
                  <div
                    key={day}
                    className="flex flex-col gap-1 text-xs uppercase tracking-[0.3em] text-slate-300/70"
                  >
                    <span>{day}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400/70">
                      {formatDayDate(day)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={`mt-3 grid w-full gap-1 ${dayGridClasses.cols} auto-rows-[72px] ${dayGridClasses.colsSm} sm:auto-rows-[76px] ${dayGridClasses.colsLg} lg:auto-rows-[84px]`}
              >
                {timeSlots.map((slot, slotIndex) => {
                  const isBreak = slot.label === breakSlotLabel;
                  return (
                    <div key={slot.label} className="contents">
                      <div
                        className={`rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-xs text-slate-200/80 col-start-1 ${ROW_START[slotIndex]}`}
                      >
                        {slot.label}
                      </div>
                      {isBreak ? (
                        <div
                          className={`flex min-h-16 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-xs uppercase tracking-[0.3em] text-amber-100 col-start-2 ${dayGridClasses.breakEnd} ${ROW_START[slotIndex]}`}
                        >
                          Break
                        </div>
                      ) : (
                        visibleDays.map((day, dayIndex) => {
                          if (isLabContinuation(day, slotIndex)) {
                            return null;
                          }
                          const key = getSlotKey(day, slot);
                          const cellBlocks = blockLookup.get(key) ?? [];
                          const mainBlock = cellBlocks[0];
                          const mergeLab =
                            mainBlock && cellBlocks.length === 1
                              ? isLabStart(mainBlock, day, slotIndex)
                              : false;

                          return (
                            <div
                              key={`${day}-${slot.label}`}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => onDrop(event, day, slotIndex)}
                              className={`rounded-xl border border-dashed px-2 py-2 text-left transition ${
                                dragSubjectId
                                  ? "border-emerald-400/40 bg-emerald-400/5"
                                  : "border-white/10 bg-(--panel-strong)"
                              } ${DAY_COL_START[dayIndex]} ${ROW_START[slotIndex]} ${
                                mergeLab ? "row-span-2" : ""
                              }`}
                            >
                              {cellBlocks.length === 0 ? (
                                <span className="text-xs text-slate-400/70">
                                  Drop here
                                </span>
                              ) : (
                                cellBlocks.map((block) => {
                                  const styles = COLOR_STYLES[block.color];
                                  const attendance = block.subjectId
                                    ? attendanceByKey.get(
                                        getAttendanceKey(attendanceDate, block),
                                      )
                                    : undefined;
                                  const statusStyle = attendance
                                    ? ATTENDANCE_STYLES[attendance.status]
                                    : null;
                                  return (
                                    <div
                                      key={block.id}
                                      onClick={() =>
                                        onOpenAttendanceModal(block)
                                      }
                                      className={`mb-1 cursor-pointer rounded-xl border px-2 py-1.5 text-[12px] leading-snug shadow-sm shadow-black/30 wrap-break-word ${
                                        statusStyle
                                          ? `ring-1 ring-inset ${statusStyle.ring}`
                                          : ""
                                      } ${styles.badge}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold text-white">
                                          {block.title}
                                        </span>
                                        {statusStyle ? (
                                          <span
                                            className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`}
                                          />
                                        ) : null}
                                        {block.part !== 2 ? (
                                          <button
                                            type="button"
                                            aria-label="Remove block"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              onRemoveBlock(block.id);
                                            }}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-400/40 bg-rose-400/10 text-base font-semibold text-rose-100/90 transition hover:bg-rose-400/20"
                                            onMouseDown={(event) =>
                                              event.stopPropagation()
                                            }
                                          >
                                            ×
                                          </button>
                                        ) : null}
                                      </div>
                                      {block.part === 2 ? (
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-200/70">
                                          Continues
                                        </p>
                                      ) : null}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-300/70">
            Weekly total: {formatHours(totalMinutes)}
          </p>
          <button
            type="button"
            onClick={onSaveTimetable}
            className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
          >
            Save weekly timetable
          </button>
        </div>
      </div>
    </section>
  );
}

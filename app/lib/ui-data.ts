import type { AttendanceStatus, ColorKey, DayLabel, Subject } from "./idb";

export const DAYS: DayLabel[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const COLOR_STYLES: Record<
  ColorKey,
  { label: string; badge: string; pill: string; dot: string }
> = {
  cobalt: {
    label: "Cobalt",
    badge: "border-blue-500/40 text-blue-100",
    pill: "bg-blue-500/20 text-blue-100",
    dot: "bg-blue-400",
  },
  moss: {
    label: "Moss",
    badge: "border-emerald-500/40 text-emerald-100",
    pill: "bg-emerald-500/20 text-emerald-100",
    dot: "bg-emerald-400",
  },
  amber: {
    label: "Amber",
    badge: "border-amber-500/40 text-amber-100",
    pill: "bg-amber-500/20 text-amber-100",
    dot: "bg-amber-300",
  },
  rose: {
    label: "Rose",
    badge: "border-rose-500/40 text-rose-100",
    pill: "bg-rose-500/20 text-rose-100",
    dot: "bg-rose-400",
  },
  slate: {
    label: "Slate",
    badge: "border-slate-400/40 text-slate-200",
    pill: "bg-slate-400/20 text-slate-100",
    dot: "bg-slate-300",
  },
  violet: {
    label: "Violet",
    badge: "border-violet-500/40 text-violet-100",
    pill: "bg-violet-500/20 text-violet-100",
    dot: "bg-violet-400",
  },
};

export const ATTENDANCE_STYLES: Record<
  AttendanceStatus,
  { label: string; dot: string; ring: string; pill: string }
> = {
  present: {
    label: "Present",
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/50",
    pill: "bg-emerald-400/20 text-emerald-100",
  },
  absent: {
    label: "Absent",
    dot: "bg-rose-400",
    ring: "ring-rose-400/50",
    pill: "bg-rose-400/20 text-rose-100",
  },
  holiday: {
    label: "Holiday",
    dot: "bg-amber-400",
    ring: "ring-amber-400/50",
    pill: "bg-amber-400/20 text-amber-100",
  },
  bunk: {
    label: "Bunk",
    dot: "bg-slate-300",
    ring: "ring-slate-300/40",
    pill: "bg-slate-300/20 text-slate-100",
  },
};

export const DEFAULT_SUBJECT_FORM = {
  name: "",
  code: "",
  instructor: "",
  room: "",
  type: "lecture" as Subject["type"],
  sessionsPerWeek: "3",
  color: "cobalt" as ColorKey,
};

export const DEFAULT_TIME_SLOTS = [
  { label: "8:45-9:45", start: "08:45", end: "09:45" },
  { label: "9:45-10:45", start: "09:45", end: "10:45" },
  { label: "10:45-11:45", start: "10:45", end: "11:45" },
  { label: "11:45-12:45", start: "11:45", end: "12:45" },
  { label: "12:30-1:30", start: "12:30", end: "13:30" },
  { label: "1:45-2:45", start: "13:45", end: "14:45" },
  { label: "2:45-3:45", start: "14:45", end: "15:45" },
  { label: "3:45-4:45", start: "15:45", end: "16:45" },
];

export type TimeSlot = (typeof DEFAULT_TIME_SLOTS)[number];

export const MAX_TIME_SLOTS = 12;

export const ROW_START = [
  "row-start-1",
  "row-start-2",
  "row-start-3",
  "row-start-4",
  "row-start-5",
  "row-start-6",
  "row-start-7",
  "row-start-8",
  "row-start-9",
  "row-start-10",
  "row-start-11",
  "row-start-12",
];

export const DAY_COL_START = [
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
  "col-start-8",
];

export const WEEK_CONFIGS = [
  {
    id: "mon-fri",
    label: "Mon–Fri",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
  {
    id: "mon-sat",
    label: "Mon–Sat",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
] as const;

export type WeekConfigId = (typeof WEEK_CONFIGS)[number]["id"];

export const TABS = [
  { id: "timetable", label: "Timetable" },
  { id: "homework", label: "Homework" },
  { id: "notes", label: "Notes" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
] as const;

export type AppTab = (typeof TABS)[number]["id"];

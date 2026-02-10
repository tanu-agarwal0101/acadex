import type { DayLabel } from "./idb";

export function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map((item) => Number(item));
  return hours * 60 + minutes;
}

export function formatTimeFromMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatDisplayTime(value: string): string {
  const [hours, minutes] = value.split(":");
  if (!minutes) {
    return value;
  }
  const parsed = Number(hours);
  if (Number.isNaN(parsed)) {
    return value;
  }
  const normalized = parsed % 12 === 0 ? 12 : parsed % 12;
  return `${normalized}:${minutes}`;
}

export function buildSlotLabel(start: string, end: string): string {
  return `${formatDisplayTime(start)}-${formatDisplayTime(end)}`;
}

export function isValidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }
  const [hours, minutes] = value.split(":").map((item) => Number(item));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

export function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function formatDate(value: string): string {
  const date = parseDate(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(value: string): string {
  const date = parseDate(value);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDayLabel(date: Date): DayLabel {
  const labels: DayLabel[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels[date.getDay()];
}

export function getGridColsClasses(dayCount: number) {
  if (dayCount === 5) {
    return {
      cols: "grid-cols-[56px_repeat(5,minmax(0,1fr))]",
      colsSm: "sm:grid-cols-[64px_repeat(5,minmax(0,1fr))]",
      colsLg: "lg:grid-cols-[72px_repeat(5,minmax(0,1fr))]",
      breakEnd: "col-end-7",
    };
  }
  return {
    cols: "grid-cols-[56px_repeat(6,minmax(0,1fr))]",
    colsSm: "sm:grid-cols-[64px_repeat(6,minmax(0,1fr))]",
    colsLg: "lg:grid-cols-[72px_repeat(6,minmax(0,1fr))]",
    breakEnd: "col-end-8",
  };
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

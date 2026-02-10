import { useEffect, useState } from "react";
import { DEFAULT_TIME_SLOTS, MAX_TIME_SLOTS } from "../lib/ui-data";
import type { TimeSlot } from "../lib/types";
import {
  buildSlotLabel,
  formatTimeFromMinutes,
  isValidTime,
  toMinutes,
} from "../lib/time-utils";

export default function useTimeSlots() {
  const [breakSlotLabel, setBreakSlotLabel] = useState("12:30-1:30");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [showTimingEditor, setShowTimingEditor] = useState(false);
  const [timeSlotDrafts, setTimeSlotDrafts] =
    useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [timeSlotError, setTimeSlotError] = useState<string | null>(null);

  useEffect(() => {
    const storedSlots = localStorage.getItem("timeSlots");
    const storedBreak = localStorage.getItem("breakSlotLabel");
    if (storedSlots) {
      try {
        const parsed = JSON.parse(storedSlots);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter(
              (slot) =>
                slot &&
                typeof slot.start === "string" &&
                typeof slot.end === "string",
            )
            .map((slot) => ({
              start: slot.start,
              end: slot.end,
              label: buildSlotLabel(slot.start, slot.end),
            }))
            .filter(
              (slot) =>
                isValidTime(slot.start) &&
                isValidTime(slot.end) &&
                toMinutes(slot.end) > toMinutes(slot.start),
            )
            .slice(0, MAX_TIME_SLOTS);
          if (normalized.length > 0) {
            setTimeSlots(normalized);
            setTimeSlotDrafts(normalized);
          }
        }
      } catch (parseError) {
        console.error(parseError);
      }
    }
    if (storedBreak) {
      setBreakSlotLabel(storedBreak);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("timeSlots", JSON.stringify(timeSlots));
    if (!timeSlots.some((slot) => slot.label === breakSlotLabel)) {
      const fallback = timeSlots[0]?.label;
      if (fallback && fallback !== breakSlotLabel) {
        setBreakSlotLabel(fallback);
      }
    }
  }, [timeSlots, breakSlotLabel]);

  useEffect(() => {
    localStorage.setItem("breakSlotLabel", breakSlotLabel);
  }, [breakSlotLabel]);

  const handleOpenTimingEditor = () => {
    setTimeSlotDrafts(timeSlots);
    setTimeSlotError(null);
    setShowTimingEditor(true);
  };

  const handleCloseTimingEditor = () => {
    setTimeSlotDrafts(timeSlots);
    setTimeSlotError(null);
    setShowTimingEditor(false);
  };

  const handleToggleTimingEditor = () => {
    if (showTimingEditor) {
      handleCloseTimingEditor();
      return;
    }
    handleOpenTimingEditor();
  };

  const handleTimeSlotChange = (
    index: number,
    field: "start" | "end",
    value: string,
  ) => {
    setTimeSlotDrafts((prev) =>
      prev.map((slot, slotIndex) => {
        if (slotIndex !== index) {
          return slot;
        }
        const next = { ...slot, [field]: value };
        return {
          ...next,
          label: buildSlotLabel(next.start, next.end),
        };
      }),
    );
    setTimeSlotError(null);
  };

  const handleAddTimeSlot = () => {
    setTimeSlotDrafts((prev) => {
      if (prev.length >= MAX_TIME_SLOTS) {
        return prev;
      }
      const last = prev[prev.length - 1];
      let startMinutes =
        last && isValidTime(last.end) ? toMinutes(last.end) : 8 * 60;
      if (startMinutes >= 23 * 60) {
        startMinutes = 8 * 60;
      }
      const endMinutes = Math.min(startMinutes + 60, 23 * 60 + 59);
      const start = formatTimeFromMinutes(startMinutes);
      const end = formatTimeFromMinutes(endMinutes);
      return [...prev, { start, end, label: buildSlotLabel(start, end) }];
    });
    setTimeSlotError(null);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlotDrafts((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, slotIndex) => slotIndex !== index);
    });
    setTimeSlotError(null);
  };

  const handleSaveTimeSlots = () => {
    if (timeSlotDrafts.length === 0) {
      setTimeSlotError("Add at least one time slot.");
      return;
    }
    if (timeSlotDrafts.length > MAX_TIME_SLOTS) {
      setTimeSlotError(`Limit ${MAX_TIME_SLOTS} slots.`);
      return;
    }

    const seen = new Set<string>();
    for (let index = 0; index < timeSlotDrafts.length; index += 1) {
      const slot = timeSlotDrafts[index];
      if (!isValidTime(slot.start) || !isValidTime(slot.end)) {
        setTimeSlotError(`Slot ${index + 1} needs valid times.`);
        return;
      }
      if (toMinutes(slot.end) <= toMinutes(slot.start)) {
        setTimeSlotError(`Slot ${index + 1} must end after it starts.`);
        return;
      }
      const key = `${slot.start}-${slot.end}`;
      if (seen.has(key)) {
        setTimeSlotError("Duplicate time slots are not allowed.");
        return;
      }
      seen.add(key);
    }

    const normalized = timeSlotDrafts.map((slot) => ({
      start: slot.start,
      end: slot.end,
      label: buildSlotLabel(slot.start, slot.end),
    }));
    setTimeSlots(normalized);
    setTimeSlotError(null);
    setShowTimingEditor(false);
  };

  return {
    breakSlotLabel,
    setBreakSlotLabel,
    timeSlots,
    showTimingEditor,
    timeSlotDrafts,
    timeSlotError,
    handleToggleTimingEditor,
    handleTimeSlotChange,
    handleAddTimeSlot,
    handleRemoveTimeSlot,
    handleSaveTimeSlots,
  };
}

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import type { DayLabel, Subject, TimeBlock, TimeSlot } from "../lib/types";
import {
  deleteBlock,
  deleteSubject,
  getAllBlocks,
  getAllSubjects,
  upsertBlock,
  upsertSubject,
} from "../lib/idb";
import { DEFAULT_SUBJECT_FORM } from "../lib/ui-data";
import { toMinutes } from "../lib/time-utils";

type UseSubjectsAndBlocksParams = {
  timeSlots: TimeSlot[];
  breakSlotLabel: string;
};

export default function useSubjectsAndBlocks({
  timeSlots,
  breakSlotLabel,
}: UseSubjectsAndBlocksParams) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectForm, setSubjectForm] = useState(DEFAULT_SUBJECT_FORM);
  const [dragSubjectId, setDragSubjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    getAllBlocks()
      .then((stored) => setBlocks(stored))
      .catch((loadError) => console.error(loadError));
    getAllSubjects()
      .then((stored) => setSubjects(stored))
      .catch((loadError) => console.error(loadError));
  }, []);

  const blockLookup = useMemo(() => {
    const map = new Map<string, TimeBlock[]>();
    for (const block of blocks) {
      const key = `${block.day}-${block.start}-${block.end}`;
      const list = map.get(key);
      if (list) {
        list.push(block);
      } else {
        map.set(key, [block]);
      }
    }
    return map;
  }, [blocks]);

  const subjectUsage = useMemo(() => {
    const usage = new Map<string, number>();
    blocks.forEach((block) => {
      if (block.subjectId) {
        if (block.part === 2) {
          return;
        }
        usage.set(block.subjectId, (usage.get(block.subjectId) ?? 0) + 1);
      }
    });
    return usage;
  }, [blocks]);

  const totalMinutes = useMemo(() => {
    return blocks.reduce((sum, block) => {
      const diff = toMinutes(block.end) - toMinutes(block.start);
      return diff > 0 ? sum + diff : sum;
    }, 0);
  }, [blocks]);

  const handleSubjectChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setSubjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const sessions = Number(subjectForm.sessionsPerWeek);
    if (!subjectForm.name.trim()) {
      setError("Add a subject name.");
      return;
    }
    if (Number.isNaN(sessions) || sessions <= 0) {
      setError("Sessions per week must be a positive number.");
      return;
    }

    const nextSubject: Subject = {
      id: crypto.randomUUID(),
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim() || undefined,
      instructor: subjectForm.instructor.trim() || undefined,
      room: subjectForm.room.trim() || undefined,
      type: subjectForm.type,
      durationSlots: subjectForm.type === "lab" ? 2 : 1,
      sessionsPerWeek: sessions,
      color: subjectForm.color,
      createdAt: Date.now(),
    };

    setSubjects((prev) => [...prev, nextSubject]);
    setSubjectForm(DEFAULT_SUBJECT_FORM);

    try {
      await upsertSubject(nextSubject);
    } catch (saveError) {
      console.error(saveError);
      setError("Save failed. Try again.");
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    const toRemove = blocks.filter((block) => block.subjectId === subjectId);
    setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
    setBlocks((prev) => prev.filter((block) => block.subjectId !== subjectId));

    try {
      await deleteSubject(subjectId);
      await Promise.all(toRemove.map((block) => deleteBlock(block.id)));
    } catch (removeError) {
      console.error(removeError);
      setError("Delete failed. Try again.");
    }
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData("text/plain", id);
    setDragSubjectId(id);
  };

  const handleDragEnd = () => {
    setDragSubjectId(null);
  };

  const handleDrop = async (
    event: DragEvent<HTMLDivElement>,
    day: DayLabel,
    slotIndex: number,
  ) => {
    event.preventDefault();
    setError(null);

    const subjectId = event.dataTransfer.getData("text/plain");
    if (!subjectId) {
      return;
    }
    const subject = subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return;
    }
    const used = subjectUsage.get(subjectId) ?? 0;
    if (used >= subject.sessionsPerWeek) {
      setError("All sessions for this subject are already placed.");
      return;
    }

    const slot = timeSlots[slotIndex];
    if (!slot) {
      return;
    }

    if (slot.label === breakSlotLabel) {
      setError("That slot is set as a break.");
      return;
    }

    const isSlotTaken = blocks.some(
      (block) => block.day === day && block.start === slot.start,
    );
    if (isSlotTaken) {
      setError("This slot is already occupied.");
      return;
    }

    const durationSlots = subject.durationSlots ?? 1;
    const groupId = crypto.randomUUID();
    if (durationSlots === 2) {
      const nextSlot = timeSlots[slotIndex + 1];
      if (!nextSlot) {
        setError("Labs need two consecutive slots.");
        return;
      }
      if (nextSlot.label === breakSlotLabel) {
        setError("Lab cannot overlap the break slot.");
        return;
      }
      const nextTaken = blocks.some(
        (block) => block.day === day && block.start === nextSlot.start,
      );
      if (nextTaken) {
        setError("Lab needs two free consecutive slots.");
        return;
      }

      const firstBlock: TimeBlock = {
        id: crypto.randomUUID(),
        title: subject.name,
        subjectId: subject.id,
        groupId,
        part: 1,
        day,
        start: slot.start,
        end: slot.end,
        location: subject.room ?? "",
        color: subject.color,
        createdAt: Date.now(),
      };

      const secondBlock: TimeBlock = {
        id: crypto.randomUUID(),
        title: subject.name,
        subjectId: subject.id,
        groupId,
        part: 2,
        day,
        start: nextSlot.start,
        end: nextSlot.end,
        location: subject.room ?? "",
        color: subject.color,
        createdAt: Date.now(),
      };

      setBlocks((prev) => [...prev, firstBlock, secondBlock]);
      try {
        await upsertBlock(firstBlock);
        await upsertBlock(secondBlock);
      } catch (saveError) {
        console.error(saveError);
        setError("Save failed. Try again.");
      }
      return;
    }

    const nextBlock: TimeBlock = {
      id: crypto.randomUUID(),
      title: subject.name,
      subjectId: subject.id,
      day,
      start: slot.start,
      end: slot.end,
      location: subject.room ?? "",
      color: subject.color,
      createdAt: Date.now(),
    };

    setBlocks((prev) => [...prev, nextBlock]);
    try {
      await upsertBlock(nextBlock);
    } catch (saveError) {
      console.error(saveError);
      setError("Save failed. Try again.");
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    const target = blocks.find((block) => block.id === blockId);
    if (!target) {
      return;
    }
    const groupId = target.groupId;
    const toRemove = groupId
      ? blocks.filter((block) => block.groupId === groupId)
      : [target];

    setBlocks((prev) =>
      prev.filter((block) => !toRemove.some((item) => item.id === block.id)),
    );
    try {
      await Promise.all(toRemove.map((block) => deleteBlock(block.id)));
    } catch (removeError) {
      console.error(removeError);
      setError("Delete failed. Try again.");
    }
  };

  const handleSaveTimetable = async () => {
    try {
      await Promise.all(blocks.map((block) => upsertBlock(block)));
      setSavedAt(Date.now());
    } catch (saveError) {
      console.error(saveError);
      setError("Save failed. Try again.");
    }
  };

  return {
    blocks,
    setBlocks,
    subjects,
    setSubjects,
    subjectForm,
    error,
    setError,
    savedAt,
    dragSubjectId,
    blockLookup,
    subjectUsage,
    totalMinutes,
    handleSubjectChange,
    handleAddSubject,
    handleRemoveSubject,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleRemoveBlock,
    handleSaveTimetable,
  };
}

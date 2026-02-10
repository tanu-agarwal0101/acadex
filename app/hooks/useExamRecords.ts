import { useEffect, useMemo, useState } from "react";
import type { ExamEntry, Subject } from "../lib/types";

const DEFAULT_INTERNALS = 2;
const STORAGE_KEY = "examRecords";

const buildEmptyEntry = (examIndex: number): ExamEntry => ({
  examIndex,
  date: "",
  attended: false,
  marksObtained: "",
  marksTotal: "",
});

const normalizeEntries = (entries: ExamEntry[], total: number) => {
  const map = new Map<number, ExamEntry>();
  entries.forEach((entry) => map.set(entry.examIndex, entry));
  const normalized: ExamEntry[] = [];
  for (let index = 0; index < total; index += 1) {
    normalized.push(map.get(index) ?? buildEmptyEntry(index));
  }
  return normalized;
};

const clampInternalCount = (value: number) => Math.min(8, Math.max(1, value));

export default function useExamRecords(subjects: Subject[]) {
  const [internalCount, setInternalCount] = useState(DEFAULT_INTERNALS);
  const [entriesBySubject, setEntriesBySubject] = useState<
    Record<string, ExamEntry[]>
  >({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as {
        internalCount?: number;
        entriesBySubject?: Record<string, ExamEntry[]>;
      };
      if (typeof parsed.internalCount === "number") {
        setInternalCount(clampInternalCount(parsed.internalCount));
      }
      if (
        parsed.entriesBySubject &&
        typeof parsed.entriesBySubject === "object"
      ) {
        setEntriesBySubject(parsed.entriesBySubject);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    setEntriesBySubject((prev) => {
      const next: Record<string, ExamEntry[]> = { ...prev };
      subjects.forEach((subject) => {
        const current = next[subject.id] ?? [];
        next[subject.id] = normalizeEntries(current, internalCount);
      });
      return next;
    });
  }, [subjects, internalCount]);

  useEffect(() => {
    const payload = {
      internalCount,
      entriesBySubject,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [internalCount, entriesBySubject]);

  const subjectsWithEntries = useMemo(() => {
    return subjects.map((subject) => ({
      subject,
      entries:
        entriesBySubject[subject.id] ?? normalizeEntries([], internalCount),
    }));
  }, [subjects, entriesBySubject, internalCount]);

  const handleInternalCountChange = (value: number) => {
    setInternalCount(clampInternalCount(value));
  };

  const updateEntry = (
    subjectId: string,
    examIndex: number,
    field: keyof Omit<ExamEntry, "examIndex">,
    value: string | boolean,
  ) => {
    setEntriesBySubject((prev) => {
      const next = { ...prev };
      const current = normalizeEntries(prev[subjectId] ?? [], internalCount);
      const updated = current.map((entry) =>
        entry.examIndex === examIndex ? { ...entry, [field]: value } : entry,
      );
      next[subjectId] = updated;
      return next;
    });
  };

  return {
    internalCount,
    setInternalCount: handleInternalCountChange,
    subjectsWithEntries,
    updateEntry,
  };
}

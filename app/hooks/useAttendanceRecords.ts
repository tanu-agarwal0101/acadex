import { useEffect, useMemo, useState } from "react";
import type {
  AttendanceFormState,
  AttendanceRecord,
  Subject,
  TimeBlock,
} from "../lib/types";
import { getAllAttendance, upsertAttendance } from "../lib/idb";
import { getDayLabel } from "../lib/time-utils";

const defaultFormState: AttendanceFormState = {
  date: new Date().toISOString().slice(0, 10),
  status: "present",
  teacherPresent: true,
  substituteName: "",
  notes: "",
  homeworkSubmitted: "",
  homeworkNext: "",
  homeworkDueDate: "",
  homeworkDone: false,
};

type UseAttendanceRecordsParams = {
  blocks: TimeBlock[];
  subjects: Subject[];
  attendanceTarget: number;
  onError: (message: string | null) => void;
};

export default function useAttendanceRecords({
  blocks,
  subjects,
  attendanceTarget,
  onError,
}: UseAttendanceRecordsParams) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [activeSession, setActiveSession] = useState<TimeBlock | null>(null);
  const [attendanceForm, setAttendanceForm] =
    useState<AttendanceFormState>(defaultFormState);

  useEffect(() => {
    getAllAttendance()
      .then((stored) => setAttendanceRecords(stored))
      .catch((loadError) => console.error(loadError));
  }, []);

  const subjectLookup = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((subject) => map.set(subject.id, subject));
    return map;
  }, [subjects]);

  const getAttendanceKey = (
    date: string,
    block: Pick<TimeBlock, "subjectId" | "day" | "start" | "end">,
  ) => `${date}-${block.subjectId ?? "unknown"}-${block.day}-${block.start}`;

  const getHomeworkKey = (subjectId: string, text: string) =>
    `${subjectId}-${text.trim().toLowerCase()}`;

  const attendanceByKey = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords
      .filter((record) => record.date === attendanceDate)
      .forEach((record) => map.set(record.id, record));
    return map;
  }, [attendanceRecords, attendanceDate]);

  const uniqueAttendanceRecords = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((record) => {
      const current = map.get(record.id);
      if (!current || record.updatedAt > current.updatedAt) {
        map.set(record.id, record);
      }
    });
    return Array.from(map.values());
  }, [attendanceRecords]);

  const homeworkMeta = useMemo(() => {
    const map = new Map<
      string,
      { dueDate?: string; done?: boolean; updatedAt: number }
    >();
    uniqueAttendanceRecords.forEach((record) => {
      if (!record.homeworkNext || !record.homeworkNext.trim()) {
        return;
      }
      const key = getHomeworkKey(record.subjectId, record.homeworkNext);
      const current = map.get(key);
      if (!current || record.updatedAt > current.updatedAt) {
        map.set(key, {
          dueDate: record.homeworkDueDate,
          done: record.homeworkDone,
          updatedAt: record.updatedAt,
        });
      }
    });
    return map;
  }, [attendanceRecords]);

  const homeworkItems = useMemo(() => {
    const items = uniqueAttendanceRecords
      .filter((record) =>
        record.homeworkNext ? record.homeworkNext.trim() : false,
      )
      .map((record) => {
        const subjectName =
          subjectLookup.get(record.subjectId)?.name ?? "Unknown subject";
        const key = getHomeworkKey(record.subjectId, record.homeworkNext ?? "");
        const meta = homeworkMeta.get(key);
        return {
          id: record.id,
          subjectId: record.subjectId,
          subjectName,
          text: record.homeworkNext?.trim() ?? "",
          assignedDate: record.date,
          dueDate: meta?.dueDate ?? record.homeworkDueDate,
          isDone: meta?.done ?? record.homeworkDone ?? false,
          record,
        };
      })
      .filter((item) => !item.isDone);

    return items.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        if (a.dueDate === b.dueDate) {
          return a.subjectName.localeCompare(b.subjectName);
        }
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (a.dueDate) {
        return -1;
      }
      if (b.dueDate) {
        return 1;
      }
      return a.subjectName.localeCompare(b.subjectName);
    });
  }, [uniqueAttendanceRecords, subjectLookup, homeworkMeta]);

  const notesBySubject = useMemo(() => {
    const map = new Map<
      string,
      { subjectName: string; records: AttendanceRecord[] }
    >();
    uniqueAttendanceRecords.forEach((record) => {
      if (!record.notes || !record.notes.trim()) {
        return;
      }
      const subjectName =
        subjectLookup.get(record.subjectId)?.name ?? "Unknown subject";
      const entry = map.get(record.subjectId) ?? {
        subjectName,
        records: [],
      };
      entry.records.push(record);
      map.set(record.subjectId, entry);
    });

    return Array.from(map.entries())
      .map(([subjectId, entry]) => ({
        subjectId,
        subjectName: entry.subjectName,
        records: entry.records.sort((a, b) => b.date.localeCompare(a.date)),
      }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [uniqueAttendanceRecords, subjectLookup]);

  const attendanceSummary = useMemo(() => {
    const bySubject = new Map<
      string,
      {
        name: string;
        total: number;
        totalNoBunk: number;
        attended: number;
        bunks: number;
        totalWithBunks: number;
      }
    >();

    uniqueAttendanceRecords.forEach((record) => {
      const name =
        subjectLookup.get(record.subjectId)?.name ?? "Unknown subject";
      const entry = bySubject.get(record.subjectId) ?? {
        name,
        total: 0,
        totalNoBunk: 0,
        attended: 0,
        bunks: 0,
        totalWithBunks: 0,
      };

      if (record.status !== "holiday") {
        entry.total += 1;
        entry.totalWithBunks += 1;
        if (record.status !== "bunk") {
          entry.totalNoBunk += 1;
        }
        if (record.status === "present") {
          entry.attended += 1;
        }
        if (record.status === "bunk") {
          entry.bunks += 1;
        }
      }

      bySubject.set(record.subjectId, entry);
    });

    return Array.from(bySubject.entries())
      .map(([subjectId, entry]) => {
        const percent = entry.total > 0 ? entry.attended / entry.total : 0;
        const required =
          percent < attendanceTarget && entry.total > 0
            ? Math.max(
                0,
                Math.ceil(
                  (attendanceTarget * entry.total - entry.attended) /
                    (1 - attendanceTarget),
                ),
              )
            : 0;
        const risk: "safe" | "at-risk" | "critical" =
          percent >= attendanceTarget
            ? "safe"
            : percent >= attendanceTarget - 0.1
              ? "at-risk"
              : "critical";
        return {
          subjectId,
          name: entry.name,
          total: entry.total,
          totalNoBunk: entry.totalNoBunk,
          attended: entry.attended,
          bunks: entry.bunks,
          totalWithBunks: entry.totalWithBunks,
          percent,
          required,
          risk,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [uniqueAttendanceRecords, subjectLookup, attendanceTarget]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const attendanceIsFuture = attendanceForm.date > todayISO;

  const openAttendanceModal = (block: TimeBlock) => {
    const key = getAttendanceKey(attendanceDate, block);
    const existing = attendanceByKey.get(key);
    setActiveSession(block);
    setAttendanceForm({
      date: existing?.date ?? attendanceDate,
      status: existing?.status ?? "present",
      teacherPresent: existing?.teacherPresent ?? true,
      substituteName: existing?.substituteName ?? "",
      notes: existing?.notes ?? "",
      homeworkSubmitted: existing?.homeworkSubmitted ?? "",
      homeworkNext: existing?.homeworkNext ?? "",
      homeworkDueDate: existing?.homeworkDueDate ?? "",
      homeworkDone: existing?.homeworkDone ?? false,
    });
  };

  const openAttendanceFromRecord = (record: AttendanceRecord) => {
    const subject = subjectLookup.get(record.subjectId);
    const block = blocks.find(
      (item) =>
        item.subjectId === record.subjectId &&
        item.day === record.day &&
        item.start === record.start,
    );

    setAttendanceDate(record.date);
    setActiveSession(
      block ?? {
        id: `attendance-${record.id}`,
        title: subject?.name ?? "Class session",
        subjectId: record.subjectId,
        day: record.day,
        start: record.start,
        end: record.end,
        location: subject?.room ?? "",
        color: subject?.color ?? "slate",
        createdAt: record.updatedAt,
      },
    );
    setAttendanceForm({
      date: record.date,
      status: record.status,
      teacherPresent: record.teacherPresent,
      substituteName: record.substituteName ?? "",
      notes: record.notes ?? "",
      homeworkSubmitted: record.homeworkSubmitted ?? "",
      homeworkNext: record.homeworkNext ?? "",
      homeworkDueDate: record.homeworkDueDate ?? "",
      homeworkDone: record.homeworkDone ?? false,
    });
  };

  const closeAttendanceModal = () => {
    setActiveSession(null);
  };

  const handleAttendanceSave = async () => {
    if (!activeSession || !activeSession.subjectId) {
      return;
    }
    const record: AttendanceRecord = {
      id: getAttendanceKey(attendanceForm.date, activeSession),
      subjectId: activeSession.subjectId,
      date: attendanceForm.date,
      day: activeSession.day,
      start: activeSession.start,
      end: activeSession.end,
      status: attendanceForm.status,
      teacherPresent: attendanceForm.teacherPresent,
      substituteName: attendanceForm.teacherPresent
        ? undefined
        : attendanceForm.substituteName.trim() || undefined,
      notes: attendanceForm.notes.trim() || undefined,
      homeworkSubmitted: attendanceForm.homeworkSubmitted.trim() || undefined,
      homeworkNext: attendanceForm.homeworkNext.trim() || undefined,
      homeworkDueDate:
        attendanceForm.homeworkNext.trim() && attendanceForm.homeworkDueDate
          ? attendanceForm.homeworkDueDate
          : undefined,
      homeworkDone: attendanceForm.homeworkDone ? true : undefined,
      updatedAt: Date.now(),
    };
    try {
      await upsertAttendance(record);
      setAttendanceRecords((prev) => {
        const next = prev.filter((item) => item.id !== record.id);
        return [...next, record];
      });
      setAttendanceDate(attendanceForm.date);
      closeAttendanceModal();
    } catch (saveError) {
      console.error(saveError);
      onError("Attendance save failed. Try again.");
    }
  };

  const handleHomeworkDone = async (record: AttendanceRecord) => {
    if (!record.homeworkNext) {
      return;
    }
    const key = getHomeworkKey(record.subjectId, record.homeworkNext);
    const updatedAt = Date.now();
    const toUpdate = attendanceRecords.filter(
      (item) =>
        item.homeworkNext &&
        getHomeworkKey(item.subjectId, item.homeworkNext) === key,
    );
    const updatedRecords = toUpdate.map((item) => ({
      ...item,
      homeworkDone: true,
      updatedAt,
    }));
    try {
      await Promise.all(updatedRecords.map((item) => upsertAttendance(item)));
      setAttendanceRecords((prev) => {
        const next = prev.filter(
          (item) => !updatedRecords.some((updated) => updated.id === item.id),
        );
        return [...next, ...updatedRecords];
      });
    } catch (saveError) {
      console.error(saveError);
      onError("Homework update failed. Try again.");
    }
  };

  const handleMarkTodayPresent = async () => {
    const today = new Date();
    const todayLabel = getDayLabel(today);
    const todayKey = today.toISOString().slice(0, 10);
    const applicableBlocks = blocks.filter(
      (block) => block.day === todayLabel && block.part !== 2,
    );
    if (applicableBlocks.length === 0) {
      onError("No classes scheduled today.");
      return;
    }

    const updates: AttendanceRecord[] = applicableBlocks.map((block) => {
      const id = getAttendanceKey(todayKey, block);
      const existing = attendanceRecords.find((item) => item.id === id);
      return {
        id,
        subjectId: block.subjectId ?? "unknown",
        date: todayKey,
        day: block.day,
        start: block.start,
        end: block.end,
        status: "present",
        teacherPresent: existing?.teacherPresent ?? true,
        substituteName: existing?.substituteName,
        notes: existing?.notes,
        homeworkSubmitted: existing?.homeworkSubmitted,
        homeworkNext: existing?.homeworkNext,
        homeworkDueDate: existing?.homeworkDueDate,
        homeworkDone: existing?.homeworkDone,
        updatedAt: Date.now(),
      };
    });

    try {
      await Promise.all(updates.map((record) => upsertAttendance(record)));
      setAttendanceRecords((prev) => {
        const next = prev.filter(
          (item) => !updates.some((record) => record.id === item.id),
        );
        return [...next, ...updates];
      });
      setAttendanceDate(todayKey);
    } catch (saveError) {
      console.error(saveError);
      onError("Update failed. Try again.");
    }
  };

  return {
    attendanceRecords,
    setAttendanceRecords,
    attendanceDate,
    setAttendanceDate,
    activeSession,
    attendanceForm,
    setAttendanceForm,
    attendanceByKey,
    attendanceIsFuture,
    attendanceSummary,
    homeworkItems,
    notesBySubject,
    subjectLookup,
    openAttendanceModal,
    openAttendanceFromRecord,
    closeAttendanceModal,
    handleAttendanceSave,
    handleHomeworkDone,
    handleMarkTodayPresent,
    getAttendanceKey,
  };
}

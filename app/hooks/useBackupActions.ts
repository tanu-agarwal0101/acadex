import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { AttendanceRecord, Subject, TimeBlock } from "../lib/types";
import {
  clearAllData,
  upsertAttendance,
  upsertBlock,
  upsertSubject,
} from "../lib/idb";

type UseBackupActionsParams = {
  subjects: Subject[];
  blocks: TimeBlock[];
  attendanceRecords: AttendanceRecord[];
  setSubjects: (value: Subject[]) => void;
  setBlocks: (value: TimeBlock[]) => void;
  setAttendanceRecords: (value: AttendanceRecord[]) => void;
  onError: (message: string | null) => void;
};

export default function useBackupActions({
  subjects,
  blocks,
  attendanceRecords,
  setSubjects,
  setBlocks,
  setAttendanceRecords,
  onError,
}: UseBackupActionsParams) {
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportData = async () => {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          subjects,
          blocks,
          attendance: attendanceRecords,
        },
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "academics-backup.json";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error(exportError);
      onError("Export failed. Try again.");
    }
  };

  const isValidBackup = (payload: unknown) => {
    if (!payload || typeof payload !== "object") {
      return false;
    }
    const record = payload as {
      data?: {
        subjects?: Subject[];
        blocks?: TimeBlock[];
        attendance?: AttendanceRecord[];
      };
    };
    if (!record.data) {
      return false;
    }
    return (
      Array.isArray(record.data.subjects) &&
      Array.isArray(record.data.blocks) &&
      Array.isArray(record.data.attendance)
    );
  };

  const handleImportFile = (file: File) => {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result ?? "");
        const payload = JSON.parse(text) as {
          data: {
            subjects: Subject[];
            blocks: TimeBlock[];
            attendance: AttendanceRecord[];
          };
        };
        if (!isValidBackup(payload)) {
          setImportError("Invalid backup file.");
          return;
        }
        const confirm = window.confirm(
          "Import will overwrite all local data. Continue?",
        );
        if (!confirm) {
          return;
        }
        await clearAllData();
        await Promise.all([
          ...payload.data.subjects.map((item) => upsertSubject(item)),
          ...payload.data.blocks.map((item) => upsertBlock(item)),
          ...payload.data.attendance.map((item) => upsertAttendance(item)),
        ]);
        setSubjects(payload.data.subjects);
        setBlocks(payload.data.blocks);
        setAttendanceRecords(payload.data.attendance);
      } catch (importError) {
        console.error(importError);
        setImportError("Import failed. Check the backup file.");
      }
    };
    reader.onerror = () => {
      setImportError("Import failed. Check the backup file.");
    };
    reader.readAsText(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportFile(file);
    }
    event.target.value = "";
  };

  const handleClearAll = async () => {
    const confirm = window.confirm(
      "This will delete all local data. Continue?",
    );
    if (!confirm) {
      return;
    }
    try {
      await clearAllData();
      setSubjects([]);
      setBlocks([]);
      setAttendanceRecords([]);
      onError(null);
      setImportError(null);
    } catch (clearError) {
      console.error(clearError);
      onError("Clear data failed. Try again.");
    }
  };

  return {
    fileInputRef,
    importError,
    handleExportData,
    handleImportClick,
    handleImportChange,
    handleClearAll,
  };
}

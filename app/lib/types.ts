import type { ChangeEvent, MouseEventHandler, RefObject } from "react";
import type {
  AttendanceRecord,
  AttendanceStatus,
  ColorKey,
  Subject,
} from "./idb";
import type { AppTab, WeekConfigId } from "./ui-data";

export type {
  AttendanceRecord,
  AttendanceStatus,
  ColorKey,
  DayLabel,
  Subject,
  TimeBlock,
} from "./idb";

export type { AppTab, TimeSlot, WeekConfigId } from "./ui-data";

export type AttendanceFormState = {
  date: string;
  status: AttendanceStatus;
  teacherPresent: boolean;
  substituteName: string;
  notes: string;
  homeworkSubmitted: string;
  homeworkNext: string;
  homeworkDueDate: string;
  homeworkDone: boolean;
};

export type SubjectFormState = {
  name: string;
  code: string;
  instructor: string;
  room: string;
  type: Subject["type"];
  sessionsPerWeek: string;
  color: ColorKey;
};

export type DayGridClasses = {
  cols: string;
  colsSm: string;
  colsLg: string;
  breakEnd: string;
};

export type HomeworkItem = {
  id: string;
  subjectName: string;
  dueDate?: string;
  assignedDate: string;
  text: string;
  record: AttendanceRecord;
};

export type NotesGroup = {
  subjectId: string;
  subjectName: string;
  records: AttendanceRecord[];
};

export type AttendanceSummary = {
  subjectId: string;
  name: string;
  total: number;
  totalNoBunk: number;
  attended: number;
  percent: number;
  required: number;
  risk: "safe" | "at-risk" | "critical";
};


export type AnalyticsTabProps = {
  attendanceSummary: AttendanceSummary[];
  attendanceTargetPercent: number;
  onTargetChange: (value: number) => void;
};

// export type AttendanceModalProps = {
//   activeSession: TimeBlock | null;
//   subjectLookup: Map<string, Subject>;
//   attendanceForm: AttendanceFormState;
//   setAttendanceForm: Dispatch<SetStateAction<AttendanceFormState>>;
//   attendanceIsFuture: boolean;
//   onSave: () => void;
//   onClose: () => void;
// };


export type BottomTabsProps = {
  tabs: readonly { id: AppTab; label: string }[];
  activeTab: AppTab;
  onSelect: (tab: AppTab) => void;
};

export type HeaderSectionProps = {
  online: boolean;
  installReady: boolean;
  savedAt: number | null;
  blocksCount: number;
  subjectsCount: number;
  onInstall: MouseEventHandler<HTMLButtonElement>;
};

export type HomeworkTabProps = {
  items: HomeworkItem[];
  onMarkDone: (record: AttendanceRecord) => void;
  onOpenSession: (record: AttendanceRecord) => void;
};

export type NotesTabProps = {
  notesBySubject: NotesGroup[];
  onOpenSession: (record: AttendanceRecord) => void;
};

export type SidebarTabsProps = {
  tabs: readonly { id: AppTab; label: string }[];
  activeTab: AppTab;
  onSelect: (tab: AppTab) => void;
};


export type SettingsTabProps = {
  attendanceTargetPercent: number;
  onTargetChange: (value: number) => void;
  weekConfig: WeekConfigId;
  onWeekConfigChange: (value: WeekConfigId) => void;
  onExport: () => void;
  onImportClick: () => void;
  onImportChange: (event: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  importError: string | null;
  onClearAll: () => void;
};

"use client";

import { useMemo, useState } from "react";
import type { AppTab, DayLabel, TimeBlock, TimeSlot } from "../lib/types";
import { TABS } from "../lib/ui-data";
import { getGridColsClasses } from "../lib/time-utils";
import useAttendanceRecords from "../hooks/useAttendanceRecords";
import useAttendanceTarget from "../hooks/useAttendanceTarget";
import useBackupActions from "../hooks/useBackupActions";
import usePwaStatus from "../hooks/usePwaStatus";
import useScheduleSettings from "../hooks/useScheduleSettings";
import useSubjectsAndBlocks from "../hooks/useSubjectsAndBlocks";
import useTimeSlots from "../hooks/useTimeSlots";
import useExamRecords from "../hooks/useExamRecords";
import useSwUpdate from "../hooks/useSwUpdate";
import AnalyticsTab from "./AnalyticsTab";
import AttendanceModal from "./AttendanceModal";
import BottomTabs from "./BottomTabs";
import ExamsTab from "./ExamsTab";
import HeaderSection from "./HeaderSection";
import HomeworkTab from "./HomeworkTab";
import NotesTab from "./NotesTab";
import SettingsTab from "./SettingsTab";
import SidebarTabs from "./SidebarTabs";
import TimetableTab from "./TimetableTab";

const getSlotKey = (day: DayLabel, slot: TimeSlot) =>
  `${day}-${slot.start}-${slot.end}`;

export default function AppClient() {
  const [activeTab, setActiveTab] = useState<AppTab>("timetable");

  const { online, installReady, handleInstall } = usePwaStatus();
  const {
    attendanceTargetPercent,
    setAttendanceTargetPercent,
    attendanceTarget,
  } = useAttendanceTarget();
  const { weekConfig, setWeekConfig, visibleDays, mobileDay, setMobileDay } =
    useScheduleSettings();
  const {
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
  } = useTimeSlots();

  const {
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
  } = useSubjectsAndBlocks({ timeSlots, breakSlotLabel });

  const {
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
  } = useAttendanceRecords({
    blocks,
    subjects,
    attendanceTarget,
    onError: setError,
  });

  const {
    fileInputRef,
    importError,
    handleExportData,
    handleImportClick,
    handleImportChange,
    handleClearAll,
  } = useBackupActions({
    subjects,
    blocks,
    attendanceRecords,
    setSubjects,
    setBlocks,
    setAttendanceRecords,
    onError: setError,
  });

  const { internalCount, setInternalCount, subjectsWithEntries, updateEntry } =
    useExamRecords(subjects);

  const { updateAvailable, handleRefresh } = useSwUpdate();

  const dayGridClasses = useMemo(
    () => getGridColsClasses(visibleDays.length),
    [visibleDays.length],
  );

  const isLabStart = (block: TimeBlock, day: DayLabel, slotIndex: number) => {
    if (!block.groupId || block.part === 2) {
      return false;
    }
    const nextSlot = timeSlots[slotIndex + 1];
    if (!nextSlot) {
      return false;
    }
    const nextBlocks = blockLookup.get(getSlotKey(day, nextSlot));
    return Boolean(
      nextBlocks?.some(
        (next) => next.groupId === block.groupId && next.part === 2,
      ),
    );
  };

  const isLabContinuation = (day: DayLabel, slotIndex: number) => {
    if (slotIndex === 0) {
      return false;
    }
    const slot = timeSlots[slotIndex];
    const slotBlocks = blockLookup.get(getSlotKey(day, slot));
    const continuation = slotBlocks?.find(
      (block) => block.part === 2 && block.groupId,
    );
    if (!continuation) {
      return false;
    }
    const prevSlot = timeSlots[slotIndex - 1];
    const prevBlocks = blockLookup.get(getSlotKey(day, prevSlot));
    return Boolean(
      prevBlocks?.some(
        (block) => block.groupId === continuation.groupId && block.part !== 2,
      ),
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-8xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-6 lg:pb-16">
        <HeaderSection
          online={online}
          installReady={installReady}
          savedAt={savedAt}
          blocksCount={blocks.length}
          subjectsCount={subjects.length}
          onInstall={handleInstall}
        />

        <div className="flex gap-6">
          <SidebarTabs
            tabs={TABS}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />

          <div className="min-w-0 flex-1">
            {activeTab === "timetable" ? (
              <TimetableTab
                subjectForm={subjectForm}
                error={error}
                subjects={subjects}
                subjectUsage={subjectUsage}
                onSubjectChange={handleSubjectChange}
                onAddSubject={handleAddSubject}
                onRemoveSubject={handleRemoveSubject}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                breakSlotLabel={breakSlotLabel}
                onBreakSlotChange={setBreakSlotLabel}
                attendanceDate={attendanceDate}
                onAttendanceDateChange={setAttendanceDate}
                onMarkTodayPresent={handleMarkTodayPresent}
                showTimingEditor={showTimingEditor}
                timeSlots={timeSlots}
                timeSlotDrafts={timeSlotDrafts}
                timeSlotError={timeSlotError}
                onToggleTimingEditor={handleToggleTimingEditor}
                onTimeSlotChange={handleTimeSlotChange}
                onAddTimeSlot={handleAddTimeSlot}
                onRemoveTimeSlot={handleRemoveTimeSlot}
                onSaveTimeSlots={handleSaveTimeSlots}
                visibleDays={visibleDays}
                mobileDay={mobileDay}
                onMobileDayChange={setMobileDay}
                dayGridClasses={dayGridClasses}
                blockLookup={blockLookup}
                dragSubjectId={dragSubjectId}
                isLabContinuation={isLabContinuation}
                isLabStart={isLabStart}
                getSlotKey={getSlotKey}
                onDrop={handleDrop}
                onOpenAttendanceModal={openAttendanceModal}
                onRemoveBlock={handleRemoveBlock}
                attendanceByKey={attendanceByKey}
                getAttendanceKey={getAttendanceKey}
                totalMinutes={totalMinutes}
                onSaveTimetable={handleSaveTimetable}
              />
            ) : null}

            {activeTab === "homework" ? (
              <HomeworkTab
                items={homeworkItems}
                onMarkDone={handleHomeworkDone}
                onOpenSession={openAttendanceFromRecord}
              />
            ) : null}

            {activeTab === "notes" ? (
              <NotesTab
                notesBySubject={notesBySubject}
                onOpenSession={openAttendanceFromRecord}
              />
            ) : null}

            {activeTab === "analytics" ? (
              <AnalyticsTab
                attendanceSummary={attendanceSummary}
                attendanceTargetPercent={attendanceTargetPercent}
                onTargetChange={setAttendanceTargetPercent}
              />
            ) : null}

            {activeTab === "exams" ? (
              <ExamsTab
                subjects={subjects}
                internalCount={internalCount}
                onInternalCountChange={setInternalCount}
                subjectsWithEntries={subjectsWithEntries}
                onUpdateEntry={updateEntry}
              />
            ) : null}

            {activeTab === "settings" ? (
              <SettingsTab
                attendanceTargetPercent={attendanceTargetPercent}
                onTargetChange={setAttendanceTargetPercent}
                weekConfig={weekConfig}
                onWeekConfigChange={setWeekConfig}
                onExport={handleExportData}
                onImportClick={handleImportClick}
                onImportChange={handleImportChange}
                fileInputRef={fileInputRef}
                importError={importError}
                onClearAll={handleClearAll}
              />
            ) : null}
          </div>
        </div>
      </main>

      <BottomTabs tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />

      {updateAvailable ? (
        <div className="fixed bottom-20 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-emerald-400/40 bg-(--panel)/95 px-4 py-3 text-sm text-slate-100 shadow-xl shadow-black/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
              Update available
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-full border border-emerald-400/40 bg-emerald-400/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
            >
              Refresh
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-200/80">
            New version available - refresh to update.
          </p>
        </div>
      ) : null}

      <AttendanceModal
        activeSession={activeSession}
        subjectLookup={subjectLookup}
        attendanceForm={attendanceForm}
        setAttendanceForm={setAttendanceForm}
        attendanceIsFuture={attendanceIsFuture}
        onSave={handleAttendanceSave}
        onClose={closeAttendanceModal}
      />
    </div>
  );
}

"use client";

import type { ExamEntry, Subject } from "../lib/types";

const formatExamLabel = (index: number) => `Internal ${index + 1}`;

type ExamsTabProps = {
  subjects: Subject[];
  internalCount: number;
  onInternalCountChange: (value: number) => void;
  subjectsWithEntries: { subject: Subject; entries: ExamEntry[] }[];
  onUpdateEntry: (
    subjectId: string,
    examIndex: number,
    field: keyof Omit<ExamEntry, "examIndex">,
    value: string | boolean,
  ) => void;
};

export default function ExamsTab({
  subjects,
  internalCount,
  onInternalCountChange,
  subjectsWithEntries,
  onUpdateEntry,
}: ExamsTabProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Internals</h2>
            <p className="mt-2 text-sm text-slate-300/70">
              Track dates, attendance, and marks for each internal exam.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-(--panel-strong) px-4 py-3">
            <label
              htmlFor="internal-count"
              className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70"
            >
              Internals this semester
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="internal-count"
                type="number"
                min={1}
                max={8}
                value={internalCount}
                onChange={(event) =>
                  onInternalCountChange(Number(event.target.value || 1))
                }
                className="w-20 rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-sm text-white focus:border-emerald-300/60 focus:outline-none"
              />
              <span className="text-xs text-slate-300/70">exams</span>
            </div>
          </div>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6 text-sm text-slate-400/70">
          Add subjects to start tracking internal exams.
        </div>
      ) : (
        <div className="space-y-4">
          {subjectsWithEntries.map(({ subject, entries }) => (
            <div
              key={subject.id}
              className="rounded-3xl border border-white/10 bg-(--panel)/80 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {subject.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-300/70">
                    {subject.code ? subject.code : "No code"}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                  {internalCount} internals
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-xs text-slate-200/80">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">
                      <th className="py-2 pr-4">Exam</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Attended</th>
                      <th className="py-2 pr-4">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {entries.map((entry) => (
                      <tr key={entry.examIndex}>
                        <td className="py-3 pr-4 font-semibold text-white">
                          {formatExamLabel(entry.examIndex)}
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="date"
                            value={entry.date}
                            aria-label={`${subject.name} ${formatExamLabel(entry.examIndex)} date`}
                            onChange={(event) =>
                              onUpdateEntry(
                                subject.id,
                                entry.examIndex,
                                "date",
                                event.target.value,
                              )
                            }
                            className="w-36 rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-xs text-white"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={entry.attended}
                              aria-label={`${subject.name} ${formatExamLabel(entry.examIndex)} attended`}
                              onChange={(event) =>
                                onUpdateEntry(
                                  subject.id,
                                  entry.examIndex,
                                  "attended",
                                  event.target.checked,
                                )
                              }
                              className="h-4 w-4 rounded border-white/10 bg-(--panel-strong)"
                            />
                            <span className="text-xs text-slate-300/70">
                              {entry.attended ? "Yes" : "No"}
                            </span>
                          </label>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={entry.marksObtained}
                              aria-label={`${subject.name} ${formatExamLabel(entry.examIndex)} marks obtained`}
                              onChange={(event) =>
                                onUpdateEntry(
                                  subject.id,
                                  entry.examIndex,
                                  "marksObtained",
                                  event.target.value,
                                )
                              }
                              className="w-20 rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-xs text-white"
                            />
                            <span className="text-xs text-slate-300/70">/</span>
                            <input
                              type="number"
                              min={0}
                              value={entry.marksTotal}
                              aria-label={`${subject.name} ${formatExamLabel(entry.examIndex)} marks total`}
                              onChange={(event) =>
                                onUpdateEntry(
                                  subject.id,
                                  entry.examIndex,
                                  "marksTotal",
                                  event.target.value,
                                )
                              }
                              className="w-20 rounded-xl border border-white/10 bg-(--panel-strong) px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import type {BottomTabsProps } from "../lib/types";


export default function BottomTabs({
  tabs,
  activeTab,
  onSelect,
}: BottomTabsProps) {
  return (
    <div className="fixed bottom-1 left-0 right-0 z-40 mx-auto w-full max-w-xl px-4 lg:hidden">
      <div className="flex flex-wrap justify-center items-center gap-2 rounded-2xl border border-white/10 bg-(--panel)/95 p-2 shadow-xl shadow-black/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`rounded-xl px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition ${
              activeTab === tab.id
                ? "bg-emerald-400/20 text-emerald-100"
                : "text-slate-300/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

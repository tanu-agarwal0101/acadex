"use client";

import type { SidebarTabsProps } from "../lib/types";


export default function SidebarTabs({
  tabs,
  activeTab,
  onSelect,
}: SidebarTabsProps) {
  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <div className="sticky top-8 space-y-2 rounded-3xl border border-white/10 bg-(--panel)/80 p-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`w-full rounded-2xl border px-4 py-3 text-left text-xs uppercase tracking-[0.3em] transition ${
              activeTab === tab.id
                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-100"
                : "border-white/10 text-slate-300/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

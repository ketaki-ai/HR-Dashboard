"use client";
// components/dashboard/NavTabs.tsx

import { TabName } from "./DashboardClient";

const TABS: { id: TabName; label: string }[] = [
  { id: "overview", label: "📊 Overview" },
  { id: "pipeline", label: "🔄 Hiring Pipeline" },
  { id: "profiles", label: "👤 All Profiles" },
  { id: "offers", label: "💰 Offers & Joiners" },
  { id: "analytics", label: "📈 Analytics" },
];

interface Props {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function NavTabs({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="flex gap-1 px-8 border-b"
      style={{
        background: "#111318",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px"
          style={{
            color: activeTab === tab.id ? "#c8f135" : "#6b7280",
            borderBottomColor: activeTab === tab.id ? "#c8f135" : "transparent",
            background: "transparent",
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

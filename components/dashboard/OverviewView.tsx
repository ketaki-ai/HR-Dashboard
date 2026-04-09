"use client";
// components/dashboard/OverviewView.tsx

import {
  StatCard,
  Card,
  BarList,
  TimelineChart,
  SectionHeader,
} from "./UIKit";
import { fmtCTC } from "@/lib/utils";

interface Props {
  analytics: any;
  candidates: any[];
}

export function OverviewView({ analytics, candidates }: Props) {
  // Timeline data
  const timelineData = Object.entries(analytics.byMonth as Record<string, number>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: month.substring(5) + "/" + month.substring(2, 4),
      count: count as number,
    }));

  // Department bars
  const deptBars = Object.entries(analytics.byDepartment as Record<string, { total: number }>)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, d]) => ({ name, value: d.total }));

  // Source bars
  const sourceBars = Object.entries(analytics.bySource as Record<string, { total: number }>)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, d]) => ({ name, value: d.total }));

  // Role bars
  const roleCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    if (c.positionApplied) roleCounts[c.positionApplied] = (roleCounts[c.positionApplied] || 0) + 1;
  });
  const roleBars = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const selectionPct = analytics.selectionRate.toFixed(1);
  const joinPct = analytics.joinRate.toFixed(1);

  return (
    <div>
      <SectionHeader
        title="Recruitment Command Centre"
        sub={`All hiring activity · ${analytics.totalProfiles} total profiles`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard number={analytics.totalProfiles} label="Total Profiles" sub="Across all departments" accent="green" delay={0} />
        <StatCard number={analytics.totalSelected} label="Selected" sub={`${selectionPct}% selection rate`} accent="purple" delay={40} />
        <StatCard number={analytics.totalJoined} label="Joined" sub={`${joinPct}% offer-to-join`} accent="cyan" delay={80} />
        <StatCard number={6} label="Departments" sub="Cross-function spread" accent="orange" delay={120} />
        <StatCard number={fmtCTC(analytics.avgCtc)} label="Avg Offered CTC" sub="Range: ₹12K–₹1.04L/mo" accent="red" delay={160} />
      </div>

      {/* Timeline + Funnel */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        <div className="col-span-2">
          <Card title="Monthly Interview Volume">
            <TimelineChart data={timelineData} />
            <div className="flex justify-between mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-[11px] text-[#6b7280]">
                Peak: Dec 2023 · {Math.max(...timelineData.map((d) => d.count), 0)} interviews
              </span>
              <span className="text-[11px] text-[#6b7280]">
                Active months: {timelineData.length}
              </span>
            </div>
          </Card>
        </div>
        <Card title="Funnel Status">
          <div className="flex flex-col gap-3">
            {[
              { label: "Rejected", count: analytics.totalRejected, color: "#ff4d6d" },
              { label: "Selected", count: analytics.totalSelected, color: "#c8f135" },
              { label: "No Status", count: analytics.totalProfiles - analytics.totalRejected - analytics.totalSelected - analytics.totalShortlisted, color: "#444" },
              { label: "Shortlisted", count: analytics.totalShortlisted, color: "#f1a535" },
            ].map(({ label, count, color }) => {
              const pct = analytics.totalProfiles > 0 ? Math.round((count / analytics.totalProfiles) * 100) : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-[13px] flex-1">{label}</span>
                  <span className="text-[12px] font-semibold" style={{ color }}>
                    {count} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 3 Bar charts */}
      <div className="grid grid-cols-3 gap-5">
        <Card title="By Department">
          <BarList items={deptBars} color="purple" />
        </Card>
        <Card title="Candidate Source">
          <BarList items={sourceBars} color="cyan" />
        </Card>
        <Card title="Top Roles Hired For">
          <BarList items={roleBars} color="orange" />
        </Card>
      </div>
    </div>
  );
}

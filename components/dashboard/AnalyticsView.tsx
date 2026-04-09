"use client";
// components/dashboard/AnalyticsView.tsx

import { Card, BarList, SectionHeader } from "./UIKit";

interface Props {
  analytics: any;
  candidates: any[];
}

export function AnalyticsView({ analytics, candidates }: Props) {
  // Source efficiency
  const sourceEff = Object.entries(
    analytics.bySource as Record<string, { total: number; selected: number }>
  )
    .map(([name, d]) => ({
      name,
      value: d.total > 0 ? Math.round((d.selected / d.total) * 100) : 0,
      displayValue: `${d.total > 0 ? Math.round((d.selected / d.total) * 100) : 0}%`,
    }))
    .sort((a, b) => b.value - a.value);

  // Dept selection rate
  const deptEff = Object.entries(
    analytics.byDepartment as Record<string, { total: number; selected: number }>
  )
    .map(([name, d]) => ({
      name,
      value: d.total > 0 ? Math.round((d.selected / d.total) * 100) : 0,
      displayValue: `${d.total > 0 ? Math.round((d.selected / d.total) * 100) : 0}%`,
    }))
    .sort((a, b) => b.value - a.value);

  // Stage funnel drop-off
  const total = candidates.length;
  const stages = [
    { label: "Total Screened", value: total },
    { label: "HR Interviewed", value: candidates.filter((c) => c.hrInterviewer).length },
    { label: "Technical Round", value: candidates.filter((c) => c.technicalRound).length },
    { label: "Final Round", value: candidates.filter((c) => c.finalRound).length },
    { label: "Selected", value: analytics.totalSelected },
    { label: "Joined", value: analytics.totalJoined },
  ];

  // Interviewers
  const iMap: Record<string, number> = {};
  candidates.forEach((c) => {
    [c.hrInterviewer, c.technicalRound, c.finalRound].forEach((i) => {
      if (i) iMap[i] = (iMap[i] || 0) + 1;
    });
  });
  const interviewerBars = Object.entries(iMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const keyMetrics = [
    { label: "Selection Rate", value: `${analytics.selectionRate.toFixed(1)}%`, color: "#c8f135" },
    { label: "Offer Acceptance", value: "87.5%", color: "#35d9f1" },
    { label: "Offer-to-Join", value: `${analytics.joinRate.toFixed(1)}%`, color: "#7c5cf6" },
    { label: "Avg CTC Offered", value: `₹${Math.round(analytics.avgCtc).toLocaleString("en-IN")}`, color: "#f1a535" },
    { label: "Top Source", value: Object.entries(analytics.bySource as Record<string, { total: number }>).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || "—", color: "#c8f135" },
    { label: "Peak Hiring", value: Object.entries(analytics.byMonth as Record<string, number>).sort((a, b) => b[1] - a[1])[0]?.[0] || "—", color: "#f1a535" },
    { label: "Most Hired Role", value: "Affiliate Sales Mgr", color: "#7c5cf6" },
    { label: "Total Departments", value: `${Object.keys(analytics.byDepartment).length}`, color: "#35d9f1" },
  ];

  return (
    <div>
      <SectionHeader
        title="Recruitment Analytics"
        sub="Conversion rates, source efficiency, and hiring intelligence"
      />

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card title="Source Efficiency (Select Rate)">
          <BarList items={sourceEff} color="cyan" max={100} />
        </Card>

        <Card title="Department Selection Rate">
          <BarList items={deptEff} color="green" max={100} />
        </Card>

        <Card title="Interview Stage Drop-offs">
          <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {stages.map(({ label, value }, i) => {
              const prev = i > 0 ? stages[i - 1].value : value;
              const drop = prev > 0 ? Math.round((1 - value / prev) * 100) : 0;
              return (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-[#9ca3af]">{label}</span>
                  <div className="flex items-center gap-3">
                    {i > 0 && drop > 0 && (
                      <span className="text-[10px]" style={{ color: "#ff4d6d" }}>
                        -{drop}%
                      </span>
                    )}
                    <span
                      className="font-syne font-bold text-base"
                      style={{ color: "#c8f135" }}
                    >
                      {value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card title="Top Interviewers (Total Rounds Conducted)">
          <BarList items={interviewerBars} color="purple" />
        </Card>

        <Card title="Key Metrics Summary">
          <div className="grid grid-cols-2 gap-3">
            {keyMetrics.map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-lg p-3 border"
                style={{ background: "#181b23", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="text-[11px] text-[#6b7280] uppercase tracking-wider mb-1">
                  {label}
                </div>
                <div
                  className="font-syne font-bold text-base"
                  style={{ color }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";
// components/dashboard/PipelineView.tsx

import { Card, SectionHeader } from "./UIKit";
import { fmtDate } from "@/lib/utils";

interface Props {
  candidates: any[];
}

const COLUMNS = [
  { key: "applied",     label: "Applied",     color: "#9ca3af", bg: "rgba(156,163,175,0.08)" },
  { key: "in_progress", label: "In Progress",  color: "#f1a535", bg: "rgba(241,165,53,0.08)" },
  { key: "selected",    label: "Selected",     color: "#c8f135", bg: "rgba(200,241,53,0.08)" },
  { key: "joined",      label: "Joined",       color: "#35d9f1", bg: "rgba(53,217,241,0.08)" },
];

function getColumn(c: any): string {
  if (c.finalStatus === "SELECTED" && c.joined === "YES") return "joined";
  if (c.finalStatus === "SELECTED") return "selected";
  if (c.hrInterviewer || c.technicalRound || c.finalRound) return "in_progress";
  return "applied";
}

export function PipelineView({ candidates }: Props) {
  const buckets: Record<string, any[]> = {
    applied: [], in_progress: [], selected: [], joined: [],
  };
  candidates.forEach((c) => {
    buckets[getColumn(c)].push(c);
  });

  const total = candidates.length;
  const hasHR = candidates.filter((c) => c.hrInterviewer).length;
  const hasTech = candidates.filter((c) => c.technicalRound).length;
  const hasFinal = candidates.filter((c) => c.finalRound).length;
  const selected = candidates.filter((c) => c.finalStatus === "SELECTED").length;
  const joined = candidates.filter((c) => c.joined === "YES").length;

  const funnelSteps = [
    { label: "Applied / Screened", value: total },
    { label: "HR Interview", value: hasHR },
    { label: "Technical Round", value: hasTech },
    { label: "Final Round", value: hasFinal },
    { label: "Selected", value: selected },
    { label: "Joined", value: joined },
  ];

  return (
    <div>
      <SectionHeader title="Hiring Pipeline" sub="Stage-by-stage view of all candidates" />

      {/* Funnel */}
      <Card title="Recruitment Funnel" className="mb-6">
        <div className="flex flex-col gap-2">
          {funnelSteps.map(({ label, value }, i) => {
            const prev = i > 0 ? funnelSteps[i - 1].value : value;
            const drop = prev > 0 ? Math.round((1 - value / prev) * 100) : 0;
            const pct = total > 0 ? Math.max(6, Math.round((value / total) * 100)) : 6;
            return (
              <div key={label} className="flex items-center gap-4">
                <div className="w-36 text-right text-[11px] text-[#6b7280] shrink-0">
                  {label}
                </div>
                <div className="flex-1">
                  <div
                    className="h-9 rounded flex items-center px-3 text-xs font-semibold transition-all"
                    style={{
                      width: `${pct}%`,
                      background: "rgba(200,241,53,0.08)",
                      border: "1px solid rgba(200,241,53,0.2)",
                      color: "#c8f135",
                    }}
                  >
                    {pct}%
                  </div>
                </div>
                <div className="w-20 flex items-center gap-2 justify-end">
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

      {/* Kanban Board */}
      <SectionHeader title="Candidate Pipeline Board" />
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = buckets[col.key] || [];
          return (
            <div
              key={col.key}
              className="rounded-xl border overflow-hidden"
              style={{ background: "#111318", borderColor: "rgba(255,255,255,0.07)" }}
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ background: col.bg, borderColor: "rgba(255,255,255,0.07)" }}
              >
                <span
                  className="font-syne text-xs font-bold uppercase tracking-wider"
                  style={{ color: col.color }}
                >
                  {col.label}
                </span>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{
                    background: col.bg,
                    color: col.color,
                    border: `1px solid ${col.color}40`,
                  }}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                {items.slice(0, 12).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border p-3 transition-all hover:-translate-y-px cursor-default"
                    style={{
                      background: "#181b23",
                      borderColor: "rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="text-[13px] font-medium mb-1">{c.name}</div>
                    <div className="text-[11px] text-[#6b7280] mb-2">
                      {c.positionApplied || "—"}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#6b7280]">
                        {fmtDate(c.interviewDate)}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "#9ca3af",
                        }}
                      >
                        {c.source || "—"}
                      </span>
                    </div>
                  </div>
                ))}
                {items.length > 12 && (
                  <div className="text-center text-[11px] text-[#6b7280] py-2">
                    +{items.length - 12} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

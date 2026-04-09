"use client";
// components/dashboard/OffersView.tsx

import { StatCard, Card, BarList, SectionHeader, StatusBadge } from "./UIKit";
import { fmtCTC, fmtDate, getInitials, AVATAR_COLORS } from "@/lib/utils";

interface Props {
  candidates: any[];
}

export function OffersView({ candidates }: Props) {
  const selected = candidates.filter((c) => c.finalStatus === "SELECTED");
  const offerAccepted = selected.filter((c) => c.offerAccepted === "YES").length;
  const joined = selected.filter((c) => c.joined === "YES").length;
  const nonJoiners = selected.filter((c) => c.joined === "NO" || c.offerAccepted === "NO");
  const maxCtc = Math.max(...selected.map((c) => c.offeredCtc || 0), 1);
  const highestCtcCandidate = selected.sort((a, b) => (b.offeredCtc || 0) - (a.offeredCtc || 0))[0];

  const acceptancePct = selected.length > 0 ? ((offerAccepted / selected.length) * 100).toFixed(1) : "0";
  const joinPct = selected.length > 0 ? ((joined / selected.length) * 100).toFixed(1) : "0";

  const ctcBars = [...selected]
    .filter((c) => c.offeredCtc)
    .sort((a, b) => b.offeredCtc - a.offeredCtc)
    .slice(0, 8)
    .map((c) => ({ name: c.name, value: c.offeredCtc }));

  return (
    <div>
      <SectionHeader title="Offers & Joiners" sub="All candidates who received offer letters" />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard number={selected.length} label="Offers Made" accent="green" />
        <StatCard number={offerAccepted} label="Offer Accepted" sub={`${acceptancePct}% acceptance rate`} accent="cyan" />
        <StatCard number={joined} label="Actually Joined" sub={`${joinPct}% of offers`} accent="purple" />
        <StatCard
          number={fmtCTC(highestCtcCandidate?.offeredCtc)}
          label="Highest CTC"
          sub={highestCtcCandidate?.name ? `${highestCtcCandidate.name}` : "—"}
          accent="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Offer tracker */}
        <Card title="Offer Tracker — All Selected Candidates">
          <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
            {selected.map((c, i) => {
              const initials = getInitials(c.name);
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const joinedStyle =
                c.joined === "YES"
                  ? "SELECTED"
                  : c.joined === "NO"
                  ? "REJECTED"
                  : "PENDING";

              return (
                <div
                  key={c.id}
                  className="flex items-center gap-4 p-3.5 rounded-xl border"
                  style={{ background: "#181b23", borderColor: "rgba(255,255,255,0.07)" }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold text-sm shrink-0"
                    style={{ background: color, color: "#0a0b0f" }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-[#6b7280] truncate">
                      {c.positionApplied} · {c.department}
                    </div>
                  </div>

                  {/* CTC */}
                  <div className="text-right shrink-0">
                    <div
                      className="font-syne font-bold text-[15px]"
                      style={{ color: "#c8f135" }}
                    >
                      {fmtCTC(c.offeredCtc)}
                    </div>
                    <div className="text-[10px] text-[#6b7280]">Per Month</div>
                  </div>

                  {/* Status */}
                  <div className="text-right shrink-0 min-w-[80px]">
                    <StatusBadge status={joinedStyle} />
                    {c.doj && (
                      <div className="text-[10px] text-[#6b7280] mt-1">
                        DOJ: {fmtDate(c.doj)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          {/* CTC bars */}
          <Card title="CTC Distribution by Role">
            <BarList items={ctcBars} color="green" max={maxCtc} />
          </Card>

          {/* Non-joiners */}
          <Card title="Non-Joiners & Reason">
            {nonJoiners.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No non-joiners recorded.</p>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {nonJoiners.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-3">
                    <StatusBadge status="REJECTED" />
                    <span className="text-sm font-medium flex-1">{c.name}</span>
                    <span className="text-xs text-[#6b7280]">{c.positionApplied}</span>
                    <span className="text-xs" style={{ color: "#f1a535" }}>
                      {c.reasonNotJoining || "Not captured"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

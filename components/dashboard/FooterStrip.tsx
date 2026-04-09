"use client";
// components/dashboard/FooterStrip.tsx

interface Props {
  total: number;
  lastRefresh: Date;
}

export function FooterStrip({ total, lastRefresh }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-8 py-2.5 border-t z-40"
      style={{ background: "#111318", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <span className="text-[11px] text-[#6b7280]">
        Pixel Mint Media · HR Recruitment Dashboard · Data: Oct 2023 – Nov 2025 ·{" "}
        <span className="text-[#c8f135] font-semibold">{total} Profiles</span>
      </span>
      <span className="text-[11px] text-[#6b7280]">
        Last refreshed: {lastRefresh.toLocaleTimeString("en-IN")} · Auto-refreshes every 30s
      </span>
    </div>
  );
}

// components/dashboard/UIKit.tsx
"use client";

import { cn } from "@/lib/utils";

// ─── STAT CARD ────────────────────────────────────────────────────────────────
type AccentColor = "green" | "purple" | "orange" | "cyan" | "red";

const ACCENT_MAP: Record<AccentColor, { line: string; text: string }> = {
  green:  { line: "#c8f135", text: "#c8f135" },
  purple: { line: "#7c5cf6", text: "#7c5cf6" },
  orange: { line: "#f1a535", text: "#f1a535" },
  cyan:   { line: "#35d9f1", text: "#35d9f1" },
  red:    { line: "#ff4d6d", text: "#ff4d6d" },
};

interface StatCardProps {
  number: string | number;
  label: string;
  sub?: string;
  accent: AccentColor;
  delay?: number;
}

export function StatCard({ number, label, sub, accent, delay = 0 }: StatCardProps) {
  const { line, text } = ACCENT_MAP[accent];
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 border transition-all hover:-translate-y-px animate-fade-up"
      style={{
        background: "#111318",
        borderColor: "rgba(255,255,255,0.07)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: line }}
      />
      <div
        className="font-syne text-4xl font-extrabold leading-none mb-1.5 tracking-tighter"
        style={{ color: text }}
      >
        {number}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
        {label}
      </div>
      {sub && <div className="text-xs text-[#6b7280] mt-1">{sub}</div>}
    </div>
  );
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn("rounded-2xl border p-6", className)}
      style={{ background: "#111318", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {title && (
        <div className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-4">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── BAR LIST ─────────────────────────────────────────────────────────────────
interface BarItem {
  name: string;
  value: number;
  displayValue?: string;
}

type BarColor = "green" | "purple" | "orange" | "cyan" | "red";

const BAR_COLORS: Record<BarColor, string> = {
  green:  "#c8f135",
  purple: "#7c5cf6",
  orange: "#f1a535",
  cyan:   "#35d9f1",
  red:    "#ff4d6d",
};

interface BarListProps {
  items: BarItem[];
  color: BarColor;
  max?: number;
}

export function BarList({ items, color, max }: BarListProps) {
  const maxVal = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.name}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[13px] text-white">{item.name}</span>
            <span className="text-[13px] font-semibold text-white">
              {item.displayValue ?? item.value}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(2, Math.round((item.value / maxVal) * 100))}%`,
                background: BAR_COLORS[color],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    SELECTED:    { bg: "rgba(200,241,53,0.12)",  text: "#c8f135", border: "rgba(200,241,53,0.25)" },
    REJECTED:    { bg: "rgba(255,77,109,0.12)",  text: "#ff4d6d", border: "rgba(255,77,109,0.25)" },
    SHORTLISTED: { bg: "rgba(241,165,53,0.12)",  text: "#f1a535", border: "rgba(241,165,53,0.25)" },
    PENDING:     { bg: "rgba(156,163,175,0.12)", text: "#9ca3af", border: "rgba(156,163,175,0.25)" },
    IN_PROGRESS: { bg: "rgba(53,217,241,0.12)",  text: "#35d9f1", border: "rgba(53,217,241,0.25)" },
  };
  const s = styles[status] ?? styles.PENDING;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {status}
    </span>
  );
}

// ─── DEPT TAG ─────────────────────────────────────────────────────────────────
export function DeptTag({ dept }: { dept: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
      style={{
        background: "rgba(124,92,246,0.1)",
        color: "#a78bfa",
        border: "1px solid rgba(124,92,246,0.2)",
      }}
    >
      {dept}
    </span>
  );
}

// ─── TIMELINE CHART ───────────────────────────────────────────────────────────
interface TimelineItem {
  month: string;
  count: number;
}

export function TimelineChart({ data }: { data: TimelineItem[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-24 pb-1">
      {data.map((item) => {
        const h = Math.max(4, Math.round((item.count / max) * 88));
        const isPeak = item.count === max;
        return (
          <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] font-semibold" style={{ color: "#9ca3af" }}>
              {item.count}
            </span>
            <div
              className="w-full rounded-t transition-all duration-700"
              style={{
                height: h,
                background: isPeak ? "#c8f135" : "#7c5cf6",
              }}
            />
            <span className="text-[9px] text-center" style={{ color: "#6b7280" }}>
              {item.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="font-syne text-xl font-bold tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-[#6b7280] mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

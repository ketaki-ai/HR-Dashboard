// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtCTC(val: number | null | undefined): string {
  if (!val) return "—";
  if (val >= 100000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val.toLocaleString("en-IN")}`;
}

export function fmtDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function statusColor(status: string): string {
  switch (status) {
    case "SELECTED":
      return "text-accent border-accent/30 bg-accent/10";
    case "REJECTED":
      return "text-rejected border-rejected/30 bg-rejected/10";
    case "SHORTLISTED":
      return "text-accent3 border-accent3/30 bg-accent3/10";
    default:
      return "text-muted2 border-border bg-surface2";
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export const AVATAR_COLORS = [
  "#c8f135","#7c5cf6","#f1a535","#35d9f1","#ff4d6d",
  "#7fff7f","#f97316","#06b6d4","#a78bfa","#84cc16",
];

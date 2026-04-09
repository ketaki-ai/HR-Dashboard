// lib/analytics.ts
import { prisma } from "./prisma";
import { FinalStatus } from "@prisma/client";

export async function computeAnalytics() {
  const candidates = await prisma.candidate.findMany();

  const total = candidates.length;
  const selected = candidates.filter((c) => c.finalStatus === "SELECTED").length;
  const joined = candidates.filter((c) => c.joined === "YES").length;
  const rejected = candidates.filter((c) => c.finalStatus === "REJECTED").length;
  const shortlisted = candidates.filter((c) => c.finalStatus === "SHORTLISTED").length;

  const ctcValues = candidates
    .filter((c) => c.offeredCtc && c.offeredCtc > 0)
    .map((c) => c.offeredCtc as number);
  const avgCtc = ctcValues.length
    ? ctcValues.reduce((a, b) => a + b, 0) / ctcValues.length
    : 0;

  // By department
  const byDepartment: Record<string, { total: number; selected: number }> = {};
  candidates.forEach((c) => {
    const dept = c.department || "Unknown";
    if (!byDepartment[dept]) byDepartment[dept] = { total: 0, selected: 0 };
    byDepartment[dept].total++;
    if (c.finalStatus === "SELECTED") byDepartment[dept].selected++;
  });

  // By source
  const bySource: Record<string, { total: number; selected: number }> = {};
  candidates.forEach((c) => {
    const src = c.source || "Unknown";
    if (!bySource[src]) bySource[src] = { total: 0, selected: 0 };
    bySource[src].total++;
    if (c.finalStatus === "SELECTED") bySource[src].selected++;
  });

  // By month
  const byMonth: Record<string, number> = {};
  candidates.forEach((c) => {
    if (c.interviewDate) {
      const key = c.interviewDate.toISOString().substring(0, 7);
      byMonth[key] = (byMonth[key] || 0) + 1;
    }
  });

  return {
    totalProfiles: total,
    totalSelected: selected,
    totalJoined: joined,
    totalRejected: rejected,
    totalShortlisted: shortlisted,
    selectionRate: total > 0 ? (selected / total) * 100 : 0,
    joinRate: selected > 0 ? (joined / selected) * 100 : 0,
    avgCtc,
    byDepartment,
    bySource,
    byMonth,
  };
}

export async function saveAnalyticsSnapshot() {
  const analytics = await computeAnalytics();
  return prisma.analyticsSnapshot.create({ data: analytics });
}

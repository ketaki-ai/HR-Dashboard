// app/page.tsx
import { prisma } from "@/lib/prisma";
import { computeAnalytics } from "@/lib/analytics";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const revalidate = 60; // ISR: revalidate page every 60 seconds

async function getData() {
  const [analytics, candidates] = await Promise.all([
    computeAnalytics(),
    prisma.candidate.findMany({
      orderBy: { interviewDate: "desc" },
      take: 200,
    }),
  ]);
  return { analytics, candidates };
}

export default async function Home() {
  let data;
  try {
    data = await getData();
  } catch {
    // Fallback to empty state if DB not connected yet
    data = {
      analytics: {
        totalProfiles: 0, totalSelected: 0, totalJoined: 0,
        totalRejected: 0, totalShortlisted: 0,
        selectionRate: 0, joinRate: 0, avgCtc: 0,
        byDepartment: {}, bySource: {}, byMonth: {},
      },
      candidates: [],
    };
  }

  return <DashboardClient initialData={data} />;
}

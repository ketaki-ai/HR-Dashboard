// app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { computeAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 60; // ISR: revalidate every 60s

export async function GET() {
  try {
    const analytics = await computeAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json({ error: "Failed to compute analytics" }, { status: 500 });
  }
}

// app/api/cron/route.ts
// Called by Vercel Cron every 5 minutes OR triggered by webhook after upload
// Add to vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "*/5 * * * *" }] }

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveAnalyticsSnapshot } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Save analytics snapshot
    await saveAnalyticsSnapshot();

    // Revalidate all dashboard pages
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/api/analytics");
    revalidatePath("/api/candidates");

    return NextResponse.json({
      success: true,
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON]", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}

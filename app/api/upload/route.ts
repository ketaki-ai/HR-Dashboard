// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromBuffer, parseStructuredData } from "@/lib/cv-parser";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel: allow 60s for parsing

export async function POST(req: NextRequest) {
  try {
    // Auth check for watcher script
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow if coming from browser (no secret needed for UI uploads)
      const contentType = req.headers.get("content-type") || "";
      if (!contentType.includes("multipart/form-data")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text
    const rawText = await extractTextFromBuffer(buffer, file.type);

    // Parse structured data
    const parsed = parseStructuredData(rawText);

    // Try to upload to Vercel Blob if token exists
    let fileUrl: string | undefined;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`cvs/${Date.now()}-${file.name}`, buffer, {
          access: "public",
          contentType: file.type,
        });
        fileUrl = blob.url;
      } catch (blobErr) {
        console.warn("Blob upload skipped:", blobErr);
      }
    }

    // Create upload batch record
    const batch = await prisma.uploadBatch.create({
      data: {
        fileName: file.name,
        fileUrl,
        status: "processing",
      },
    });

    // Create candidate record
    const candidate = await prisma.candidate.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        positionApplied: parsed.positionApplied || "To Be Assigned",
        department: inferDepartment(parsed.positionApplied),
        totalExperience: parsed.totalExperience,
        education: parsed.education,
        currentLocation: parsed.currentLocation,
        source: "CV Upload",
        finalStatus: "PENDING",
        interviewDate: new Date(),
        cvFileUrl: fileUrl,
        cvFileName: file.name,
        parsedData: {
          skills: parsed.skills,
          rawText: parsed.rawText,
        },
      },
    });

    // Update batch as done
    await prisma.uploadBatch.update({
      where: { id: batch.id },
      data: { status: "completed", parsed: 1 },
    });

    return NextResponse.json({
      success: true,
      candidate,
      parsed: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        skills: parsed.skills,
      },
    });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json(
      { error: "Failed to process CV" },
      { status: 500 }
    );
  }
}

function inferDepartment(position: string | null): string {
  if (!position) return "Unassigned";
  const p = position.toLowerCase();
  if (p.includes("campaign") || p.includes("delivery")) return "Campaign Management";
  if (p.includes("affiliate") || p.includes("sales") || p.includes("biz")) return "Business Development";
  if (p.includes("biddable") || p.includes("media buyer")) return "Biddable Media";
  if (p.includes("client servicing") || p.includes("account manager")) return "Client Servicing";
  if (p.includes("marketing") || p.includes("content") || p.includes("intern")) return "Marketing";
  if (p.includes("accounts") || p.includes("finance") || p.includes("billing")) return "Accounts & Finance";
  return "Unassigned";
}

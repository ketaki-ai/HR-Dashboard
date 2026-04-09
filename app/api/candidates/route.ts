// app/api/candidates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const dept = searchParams.get("dept");
    const search = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (status && status !== "all") where.finalStatus = status.toUpperCase();
    if (dept) where.department = dept;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { positionApplied: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: { interviewDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({ candidates, total, page, limit });
  } catch (error) {
    console.error("[GET /api/candidates]", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidate = await prisma.candidate.create({ data: body });
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("[POST /api/candidates]", error);
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}

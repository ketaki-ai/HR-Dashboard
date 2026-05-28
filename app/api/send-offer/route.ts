import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const {
      candidateName, candidateEmail, position, department,
      offeredCTC, joiningDate, reportingManager, jobLocation,
      workSetup, workDays
    } = await request.json()

    const hrEmail = process.env.GMAIL_USER || 'ketaki@pixelmintmedia.com'

    const ctcNum = Number(offeredCTC) || 0
    const ctcFormatted = ctcNum > 0
      ? `Rs. ${ctcNum.toLocaleString('en-IN')}/-`
      : 'as discussed'

    const fmtDate = (d: string) => {
      if (!d) ret

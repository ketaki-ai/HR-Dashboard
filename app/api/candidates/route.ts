import { NextResponse } from 'next/server'
import { getCandidates } from '@/lib/sheets'

export const revalidate = 3600 // refresh every hour

export async function GET() {
  try {
    const candidates = await getCandidates()
    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

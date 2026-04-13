import { NextResponse } from 'next/server'
import { addCandidate } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await addCandidate(body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding candidate:', error)
    return NextResponse.json({ error: 'Failed to add candidate' }, { status: 500 })
  }
}

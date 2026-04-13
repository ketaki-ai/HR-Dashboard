import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('cv') as File
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 }
            },
            {
              type: 'text',
              text: 'Read this CV carefully. Return ONLY this JSON with real values from the CV, no explanation, no markdown:\n{"name":"","email":"","phone":"","education":"","location":"","totalExperience":"","relevantExperience":"","position":""}'
            }
          ]
        }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data))
      return NextResponse.json({ error: 'AI error: ' + (data.error?.message || 'unknown') }, { status: 500 })
    }

    const text = data.content?.[0]?.text || '{}'
    const match = text.match(/\{[\s\S]*\}/)
    const parsed = match ? JSON.parse(match[0]) : {}

    return NextResponse.json({ candidate: parsed })
  } catch (error) {
    console.error('CV parse error:', error)
    return NextResponse.json({ error: 'Failed to parse CV' }, { status: 500 })
  }
}

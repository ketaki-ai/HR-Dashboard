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
        model: 'claude-opus-4-5',
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
              text: `Extract candidate information from this CV/resume. Return ONLY a valid JSON object with no other text, no markdown, no backticks:
{"name":"full name here","email":"email here","phone":"digits only no spaces","education":"highest qualification e.g. MBA BBA BCom BTech","location":"current city","totalExperience":"e.g. 3 years or Fresher","relevantExperience":"relevant years if mentioned","position":"job title or role they apply for"}
Use empty string for any missing fields.`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || '{}'
    
    // Clean up any markdown formatting
    const clean = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()
    
    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch {
      // Try to extract JSON from response
      const match = clean.match(/\{[\s\S]*\}/)
      parsed = match ? JSON.parse(match[0]) : {}
    }

    return NextResponse.json({ candidate: parsed })
  } catch (error) {
    console.error('CV parse error:', error)
    return NextResponse.json({ error: 'Failed to parse CV' }, { status: 500 })
  }
}

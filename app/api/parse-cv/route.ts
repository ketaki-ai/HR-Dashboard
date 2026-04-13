import { NextResponse } from 'next/server'

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
              text: `Extract candidate information from this CV. Return ONLY a JSON object with these exact fields, no other text:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number (digits only, no spaces or dashes)",
  "education": "highest qualification only e.g. MBA, B.Com, B.Tech, BMS",
  "location": "current city",
  "totalExperience": "total years e.g. 3 years, Fresher",
  "relevantExperience": "relevant experience if mentioned",
  "position": "most recent job title or position they are applying for",
  "department": ""
}
If a field is not found, use empty string "".`
            }
          ]
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ candidate: parsed })
  } catch (error) {
    console.error('CV parse error:', error)
    return NextResponse.json({ error: 'Failed to parse CV' }, { status: 500 })
  }
}

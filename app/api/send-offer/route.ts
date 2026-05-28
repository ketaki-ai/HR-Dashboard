import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { candidateName, candidateEmail, position, department, offeredCTC, joiningDate } = await request.json()
    const ctcFormatted = offeredCTC ? `₹${Number(offeredCTC).toLocaleString('en-IN')} per annum` : 'as discussed'

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; color: #1a1a1a; padding: 20px;">
  <img src="https://myhr-dashboardpmm.vercel.app/logo.jpg" alt="Pixel Mint Media" style="height: 50px; margin-bottom: 24px;" />
  <p>Dear ${candidateName},</p>
  <p>We are pleased to extend this offer of employment to you at <strong>Pixel Mint Media</strong>.</p>
  <p>After careful consideration, we are delighted to offer you the position of <strong>${position}</strong> in the <strong>${department}</strong> department.</p>
  <table style="border-collapse: collapse; width: 100%; margin: 20px 0; background: #f9f9f9;">
    <tr><td style="padding: 12px 16px; font-weight: bold; color: #555; width: 40%;">Position</td><td style="padding: 12px 16px;">${position}</td></tr>
    <tr style="background:#fff;"><td style="padding: 12px 16px; font-weight: bold; color: #555;">Department</td><td style="padding: 12px 16px;">${department}</td></tr>
    <tr><td style="padding: 12px 16px; font-weight: bold; color: #555;">Offered CTC</td><td style="padding: 12px 16px;">${ctcFormatted}</td></tr>
    ${joiningDate ? `<tr style="background:#fff;"><td style="padding: 12px 16px; font-weight: bold; color: #555;">Date of Joining</td><td style="padding: 12px 16px;">${joiningDate}</td></tr>` : ''}
  </table>
  <p>Kindly confirm your acceptance of this offer by replying to this email at the earliest.</p>
  <p>We look forward to welcoming you to the Pixel Mint Media family!</p>
  <p>Warm regards,<br/><strong>Ketaki Vaidya</strong><br/>HR Manager, Pixel Mint Media<br/>
  <a href="mailto:ketaki@pixelmintmedia.com">ketaki@pixelmintmedia.com</a></p>
</div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ketaki Vaidya - HR <onboarding@resend.dev>',
        to: [candidateEmail],
        subject: `Offer Letter - ${position} | Pixel Mint Media`,
        html,
        reply_to: process.env.GMAIL_USER,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send offer error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

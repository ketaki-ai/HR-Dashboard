import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { employeeName, employeeEmail, type, years } = await request.json()
    const hrEmail = process.env.GMAIL_USER || 'ketaki@pixelmintmedia.com'
    const isBirthday = type === 'birthday'

    const subject = isBirthday
      ? `Happy Birthday ${employeeName}! 🎂`
      : `Happy Work Anniversary ${employeeName}! 🎉`

    const messageHtml = isBirthday
      ? `<div style="font-family:Arial,sans-serif;max-width:500px;color:#1a1a1a;padding:20px;">
          <img src="https://myhr-dashboardpmm.vercel.app/logo.jpg" alt="Pixel Mint Media" style="height:50px;margin-bottom:24px;" />
          <p>Dear ${employeeName},</p>
          <p>🎂 Wishing you a very <strong>Happy Birthday!</strong></p>
          <p>May this special day bring you joy, happiness, and all that you wish for. Thank you for being an amazing part of the Pixel Mint Media family!</p>
          <p>Have a wonderful day!</p>
          <p>Warm regards,<br/><strong>Ketaki Vaidya</strong><br/>HR Manager, Pixel Mint Media</p>
        </div>`
      : `<div style="font-family:Arial,sans-serif;max-width:500px;color:#1a1a1a;padding:20px;">
          <img src="https://myhr-dashboardpmm.vercel.app/logo.jpg" alt="Pixel Mint Media" style="height:50px;margin-bottom:24px;" />
          <p>Dear ${employeeName},</p>
          <p>🎉 Congratulations on completing <strong>${years} year${years > 1 ? 's' : ''}</strong> with Pixel Mint Media!</p>
          <p>Your dedication, hard work, and contribution have been invaluable to our team. We are truly grateful to have you with us.</p>
          <p>Here's to many more years of success together!</p>
          <p>Warm regards,<br/><strong>Ketaki Vaidya</strong><br/>HR Manager, Pixel Mint Media</p>
        </div>`

    const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;padding:16px;background:#fff3cd;border:2px solid #ffc107;border-radius:8px;margin-bottom:24px;">
  <p style="margin:0;font-size:15px;font-weight:bold;">📧 Action Required: Forward this email to the employee</p>
  <p style="margin:8px 0 4px;">Employee email: <a href="mailto:${employeeEmail}" style="color:#0066cc;font-weight:bold;">${employeeEmail}</a></p>
  <p style="margin:0;font-size:12px;color:#666;">Please remove this yellow box before forwarding.</p>
</div>
${messageHtml}`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HR Dashboard <onboarding@resend.dev>',
        to: [hrEmail],
        subject: `${subject} - Forward to Employee`,
        html,
      }),
    })

    if (!res.ok) throw new Error(await res.text())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Birthday email error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

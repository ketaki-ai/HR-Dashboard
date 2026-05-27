import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { employeeName, employeeEmail, type, years } = await request.json()

    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.MICROSOFT_CLIENT_ID || '',
          client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
          scope: 'https://graph.microsoft.com/.default',
        }),
      }
    )

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('Failed to get access token')

    const isBirthday = type === 'birthday'
    const subject = isBirthday
      ? `Happy Birthday ${employeeName}! 🎂`
      : `Happy Work Anniversary ${employeeName}! 🎉`

    const emailBody = isBirthday
      ? `<div style="font-family: Arial, sans-serif; max-width: 500px; color: #1a1a1a;">
          <img src="https://myhr-dashboardpmm.vercel.app/logo.jpg" alt="Pixel Mint Media" style="height: 50px; margin-bottom: 24px;" />
          <p>Dear ${employeeName},</p>
          <p>🎂 Wishing you a very <strong>Happy Birthday!</strong></p>
          <p>May this special day bring you joy, happiness, and all that you wish for. Thank you for being an amazing part of the Pixel Mint Media family!</p>
          <p>Have a wonderful day!</p>
          <p>Warm regards,<br/><strong>Ketaki Vaidya</strong><br/>HR Manager, Pixel Mint Media</p>
        </div>`
      : `<div style="font-family: Arial, sans-serif; max-width: 500px; color: #1a1a1a;">
          <img src="https://myhr-dashboardpmm.vercel.app/logo.jpg" alt="Pixel Mint Media" style="height: 50px; margin-bottom: 24px;" />
          <p>Dear ${employeeName},</p>
          <p>🎉 Congratulations on completing <strong>${years} year${years > 1 ? 's' : ''}</strong> with Pixel Mint Media!</p>
          <p>Your dedication, hard work, and contribution have been invaluable to our team. We are truly grateful to have you with us.</p>
          <p>Here's to many more years of success together!</p>
          <p>Warm regards,<br/><strong>Ketaki Vaidya</strong><br/>HR Manager, Pixel Mint Media</p>
        </div>`

    await fetch(
      `https://graph.microsoft.com/v1.0/users/${process.env.HR_EMAIL}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: 'HTML', content: emailBody },
            toRecipients: [{ emailAddress: { address: employeeEmail } }],
            from: { emailAddress: { address: process.env.HR_EMAIL, name: 'Ketaki Vaidya - HR' } },
          },
          saveToSentItems: true,
        }),
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send birthday/anniversary error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

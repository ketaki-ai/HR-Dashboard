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
      if (!d) return 'as discussed'
      const dt = new Date(d)
      const day = dt.getDate()
      const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
      return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).replace(String(day), `${day}${suffix}`)
    }

    const today = fmtDate(new Date().toISOString())
    const joiningFmt = fmtDate(joiningDate)

    const offerLetterHtml = `
<div style="font-family: Arial, sans-serif; max-width: 700px; color: #1a1a1a; line-height: 1.6;">
  <div style="text-align: center; border-bottom: 2px solid #1a3a6b; padding-bottom: 16px; margin-bottom: 24px;">
    <img src="https://myhr-dashboardpmm.vercel.app/logo.jpg" alt="Pixel Mint Media" style="height: 60px;" />
  </div>
  <p style="margin-bottom: 20px;">Date: ${today}</p>
  <p>To</p>
  <p style="margin-bottom: 20px;"><strong>${candidateName}</strong></p>
  <p style="margin-bottom: 20px;"><strong>Sub: Offer Letter</strong></p>
  <p>Dear ${candidateName.split(' ')[0]},</p>
  <p>We are happy to offer you a position as a <strong>'${position}'</strong> with our Company.</p>
  <p>Your compensation would be <strong>${ctcFormatted}</strong> per annum (CTC)</p>
  <p>Your date of work commencement with us will be <strong>${joiningFmt}</strong>${reportingManager ? `, and you will report to <strong>${reportingManager}</strong>` : ''}.</p>
  ${(workSetup || workDays || jobLocation) ? `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f9fa;">
    ${workSetup ? `<tr><td style="padding:10px 16px;font-weight:bold;color:#555;width:35%;border-bottom:1px solid #e9ecef;">Work Setup</td><td style="padding:10px 16px;border-bottom:1px solid #e9ecef;">${workSetup}</td></tr>` : ''}
    ${workDays ? `<tr><td style="padding:10px 16px;font-weight:bold;color:#555;border-bottom:1px solid #e9ecef;">Work Days</td><td style="padding:10px 16px;border-bottom:1px solid #e9ecef;">${workDays}</td></tr>` : ''}
    ${jobLocation ? `<tr><td style="padding:10px 16px;font-weight:bold;color:#555;">Job Location</td><td style="padding:10px 16px;">${jobLocation}</td></tr>` : ''}
  </table>` : ''}
  <p>As per company policy, the probationary period for this position is six months from the date of commencement of work. The probation period may however, be extended at the discretion of the Company.</p>
  <p>You will be required to carry out such duties and job functions in which you may be instructed from time to time by the Company or persons acting on behalf of the Company and you may be transferred from one section or department, at the discretion of the Company.</p>
  <p>You will be paid gross emoluments as detailed in the Salary Structure.</p>
  <p>We congratulate you on your appointment and wish you a long and successful career with us. We are confident that your contribution will take us further in our journey towards becoming the industry leader and we assure you of our support for your professional development and growth.</p>
  <p style="margin-top:24px;font-style:italic;color:#666;font-size:13px;">*****This letter is system-generated and does not require any stamp or signature*****</p>
  <hr style="border:none;border-top:1px solid #e9ecef;margin:32px 0;" />
  <div style="background:#f0f7ff;border-left:4px solid #1a3a6b;padding:20px;margin-bottom:24px;">
    <h3 style="margin:0 0 16px;color:#1a3a6b;">Required Documents for Onboarding</h3>
    <p style="margin:0 0 12px;color:#555;">Please submit the following documents to complete your onboarding process. Ensure that all copies are clear and legible.</p>
    <ul style="margin:0;padding-left:20px;color:#333;line-height:2;">
      <li>Proof of Identification – PAN Card and Updated Aadhaar Card</li>
      <li>Proof of Address – Utility Bill, Bank Statement, or any Government-issued Address Document</li>
      <li>Bank Account Details for Salary Processing – Cancelled Cheque (until salary account activation)</li>
      <li>Educational Certificates – SSC, HSC, Graduation, and any relevant qualifications; PF documentation (if applicable)</li>
      <li>Last Working Relieving Letter / Experience Letter</li>
      <li>Last Working Salary Slips and Offer Letter</li>
    </ul>
    <p style="margin:12px 0 0;font-style:italic;color:#666;font-size:13px;">For any queries regarding documentation, please connect with the HR team.</p>
  </div>
  <p>Warm regards,</p>
  <p><strong>Ketaki Vaidya</strong><br/>
  HR Manager<br/>
  Pixel Mint Media<br/>
  <a href="mailto:ketaki@pixelmintmedia.com" style="color:#1a3a6b;">ketaki@pixelmintmedia.com</a></p>
</div>`

    const emailBody = `
<div style="font-family:Arial,sans-serif;max-width:700px;padding:16px;background:#fff3cd;border:2px solid #ffc107;border-radius:8px;margin-bottom:24px;">
  <p style="margin:0;font-size:15px;font-weight:bold;">📧 Forward this email to the candidate</p>
  <p style="margin:8px 0 4px;">Candidate: <strong>${candidateName}</strong> — <a href="mailto:${candidateEmail}" style="color:#0066cc;">${candidateEmail}</a></p>
  <p style="margin:0;font-size:12px;color:#666;">Please remove this yellow box before forwarding to the candidate.</p>
</div>
${offerLetterHtml}`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HR Dashboard <onboarding@resend.dev>',
        to: [hrEmail],
        subject: `Offer Letter Ready — ${candidateName} (${position})`,
        html: emailBody,
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

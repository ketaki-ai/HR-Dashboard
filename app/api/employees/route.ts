import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}')
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function GET() {
  try {
    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID || ''

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Employee Master Data!A2:R',
    })

    const rows = res.data.values || []
    const employees = rows
      .filter(r => r[2] && r[2].toString().trim())
      .map((r, i) => ({
        id: r[0] || String(i + 1),
        empCode: r[1] || '',
        name: r[2] || '',
        designation: r[3] || '',
        department: r[4] || '',
        reportingTo: r[5] || '',
        status: r[6] || '',
        birthDate: r[7] || '',
        joiningDate: r[8] || '',
        officialEmail: r[9] || '',
        contactNo: r[10] || '',
        personalEmail: r[11] || '',
        bloodGroup: r[12] || '',
        maritalStatus: r[13] || '',
        education: r[14] || '',
        activeStatus: r[15] || '',
        lastWorkingDay: r[16] || '',
        reasonForLeaving: r[17] || '',
      }))

    return NextResponse.json({ employees }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID || ''

    const existingRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Employee Master Data!A:A',
    })
    const nextId = (existingRes.data.values?.length || 1)

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Employee Master Data!A:R',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          nextId, body.empCode, body.name, body.designation, body.department,
          body.reportingTo, body.status, body.birthDate, body.joiningDate,
          body.officialEmail, body.contactNo, body.personalEmail,
          body.bloodGroup, body.maritalStatus, body.education,
          body.activeStatus || 'Active', '', ''
        ]]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding employee:', error)
    return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 })
  }
}

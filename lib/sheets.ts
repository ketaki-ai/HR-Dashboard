import { google } from 'googleapis'

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  education: string
  location: string
  totalExperience: string
  relevantExperience: string
  source: string
  sourceDetails: string
  interviewDate: string
  monthYear: string
  hrInterview: string
  technicalRound: string
  finalRound: string
  finalStatus: string
  offeredCTC: string
  doj: string
  offerAccepted: string
  joined: string
  reasonNotJoining: string
}

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}')
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function getCandidates(): Promise<Candidate[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const sheetId = process.env.GOOGLE_SHEET_ID || ''

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Candidates!A2:W',
  })

  const rows = res.data.values || []
  return rows
    .filter(r => r[1] && r[1].toString().trim())
    .map((r, i) => ({
      id: r[0] || String(i + 1),
      name: r[1] || '',
      email: r[2] || '',
      phone: r[3] || '',
      position: r[4] || '',
      department: r[5] || '',
      education: r[6] || '',
      location: r[7] || '',
      totalExperience: r[8] || '',
      relevantExperience: r[9] || '',
      source: r[10] || '',
      sourceDetails: r[11] || '',
      interviewDate: r[12] || '',
      monthYear: r[13] || '',
      hrInterview: r[14] || '',
      technicalRound: r[15] || '',
      finalRound: r[16] || '',
      finalStatus: r[17] || '',
      offeredCTC: r[18] || '',
      doj: r[19] || '',
      offerAccepted: r[20] || '',
      joined: r[21] || '',
      reasonNotJoining: r[22] || '',
    }))
}

export async function addCandidate(candidate: Omit<Candidate, 'id'>): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const sheetId = process.env.GOOGLE_SHEET_ID || ''

  const existingRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Candidates!A:A',
  })
  const nextId = (existingRes.data.values?.length || 1)

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Candidates!A:W',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        nextId,
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.position,
        candidate.department,
        candidate.education,
        candidate.location,
        candidate.totalExperience,
        candidate.relevantExperience,
        candidate.source,
        candidate.sourceDetails,
        candidate.interviewDate,
        candidate.monthYear,
        candidate.hrInterview,
        candidate.technicalRound,
        candidate.finalRound,
        candidate.finalStatus,
        candidate.offeredCTC,
        candidate.doj,
        candidate.offerAccepted,
        candidate.joined,
        candidate.reasonNotJoining,
      ]],
    },
  })
}

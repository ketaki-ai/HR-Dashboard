# PMM Recruitment Dashboard

A live recruitment pipeline tracker connected to Google Sheets.

---

## SETUP GUIDE (Do this once)

### Step 1 — Create your Google Sheet

1. Go to **sheets.google.com** and create a new sheet
2. Name it **PMM Recruitment Tracker**
3. Rename the first tab (bottom left) to **Candidates**
4. In row 1, add these exact headers in order:
   - A: ID
   - B: Name
   - C: Email
   - D: Phone
   - E: Position
   - F: Department
   - G: Education
   - H: Location
   - I: Total Experience
   - J: Relevant Experience
   - K: Source
   - L: Source Details
   - M: Interview Date
   - N: Month/Year
   - O: HR Interview
   - P: Technical Round
   - Q: Culture Round
   - R: Final Status
   - S: Offered CTC
   - T: Date of Joining
   - U: Offer Accepted
   - V: Joined
   - W: Reason Not Joining

5. Copy your existing 119 candidate entries starting from row 2

### Step 2 — Get your Google Sheet ID

Your Sheet ID is in the URL:
`https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit`

Copy everything between `/d/` and `/edit`

### Step 3 — Create a Google Service Account

1. Go to **console.cloud.google.com**
2. Create a new project (or use existing)
3. Go to **APIs & Services → Enable APIs**
4. Enable **Google Sheets API**
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → Service Account**
7. Name it `hr-dashboard` and click Create
8. Click on the service account → **Keys tab → Add Key → JSON**
9. A JSON file will download — keep this safe!

### Step 4 — Share your Sheet with the service account

1. Open the downloaded JSON file
2. Find the `client_email` field (looks like `hr-dashboard@project.iam.gserviceaccount.com`)
3. Open your Google Sheet
4. Click **Share** and paste that email address
5. Give it **Editor** access

### Step 5 — Add Environment Variables to Vercel

1. Go to **vercel.com** → your project → **Settings → Environment Variables**
2. Add these two variables:

**Variable 1:**
- Name: `GOOGLE_SHEET_ID`
- Value: your Sheet ID from Step 2

**Variable 2:**
- Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
- Value: the ENTIRE contents of the JSON file (open it in Notepad, select all, copy)

3. Click Save and **Redeploy** your project

---

## DEPLOYING TO VERCEL

1. Upload this entire folder to your GitHub repository
2. Connect it to Vercel
3. Add the environment variables above
4. Deploy!

---

## ADDING NEW CANDIDATES

You can add candidates in two ways:
1. **From the dashboard** — click the "+ Add Candidate" button
2. **Directly in Google Sheets** — add a new row and the dashboard refreshes automatically

---

## HOW AUTO-REFRESH WORKS

The dashboard refreshes data every hour automatically.
You can also click the **↻ Refresh** button anytime to get the latest data instantly.

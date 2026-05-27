'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const WA_GROUP = 'https://chat.whatsapp.com/Bcbfh9PJZoUGgAuf7lSwc7'

interface Employee {
  id: string; empCode: string; name: string; designation: string
  department: string; reportingTo: string; status: string
  birthDate: string; joiningDate: string; officialEmail: string
  contactNo: string; personalEmail: string; bloodGroup: string
  maritalStatus: string; education: string; activeStatus: string
  lastWorkingDay: string; reasonForLeaving: string
}

interface Candidate {
  id: string; name: string; email: string; phone: string
  position: string; department: string; education: string; location: string
  totalExperience: string; relevantExperience: string; source: string
  sourceDetails: string; interviewDate: string; monthYear: string
  hrInterview: string; technicalRound: string; finalRound: string
  finalStatus: string; offeredCTC: string; doj: string
  offerAccepted: string; joined: string; reasonNotJoining: string
}

const STATUS_COLORS: Record<string, string> = {
  Selected: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-700',
  Shortlisted: 'bg-amber-100 text-amber-800',
  'Joined & Left': 'bg-orange-100 text-orange-700',
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200">
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-medium">{label}</p>
      <p className={`text-3xl font-semibold ${color || 'text-stone-800'}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}

function InsightsPanel({ candidates }: { candidates: Candidate[] }) {
  const total = candidates.length
  const selected = candidates.filter(c => c.finalStatus === 'Selected').length
  const joined = candidates.filter(c => c.joined === 'Yes').length
  const shortlisted = candidates.filter(c => c.finalStatus === 'Shortlisted').length
  const hrRound = candidates.filter(c => c.hrInterview).length
  const technical = candidates.filter(c => c.technicalRound).length
  const offered = candidates.filter(c => c.offeredCTC && c.offeredCTC !== '').length
  const joinedAndLeft = candidates.filter(c => c.finalStatus === 'Joined & Left').length

  const convRate = hrRound > 0 ? (selected / hrRound) * 100 : 0
  const offerAccept = offered > 0 ? (joined / offered) * 100 : 0
  const techDropOff = hrRound > 0 ? ((hrRound - technical) / hrRound) * 100 : 0
  const attritionRate = joined > 0 ? (joinedAndLeft / joined) * 100 : 0

  const sourceCounts = candidates.reduce((acc, c) => {
    if (!c.source) return acc
    if (!acc[c.source]) acc[c.source] = { total: 0, selected: 0 }
    acc[c.source].total++
    if (c.finalStatus === 'Selected') acc[c.source].selected++
    return acc
  }, {} as Record<string, { total: number; selected: number }>)
  const bestSource = Object.entries(sourceCounts).sort((a, b) => b[1].selected - a[1].selected)[0]

  const insights: { icon: string; color: string; text: string }[] = []

  // Funnel health
  if (convRate < 10) insights.push({ icon: '🔴', color: 'border-red-200 bg-red-50', text: `Low conversion: only ${convRate.toFixed(0)}% of HR interviews are resulting in hires. Industry benchmark is 15–20%.` })
  else if (convRate >= 20) insights.push({ icon: '🟢', color: 'border-emerald-200 bg-emerald-50', text: `Strong pipeline: ${convRate.toFixed(0)}% HR-to-hire conversion — above the 15–20% benchmark. Great work!` })
  else insights.push({ icon: '🟡', color: 'border-amber-200 bg-amber-50', text: `Pipeline converting at ${convRate.toFixed(0)}%. Slightly below the 20% benchmark — review rejection reasons.` })

  // Offer acceptance
  if (offerAccept < 50 && offered > 2) insights.push({ icon: '🔴', color: 'border-red-200 bg-red-50', text: `Offer acceptance is low at ${offerAccept.toFixed(0)}%. Review CTC competitiveness and offer turnaround time.` })
  else if (offerAccept >= 75) insights.push({ icon: '🟢', color: 'border-emerald-200 bg-emerald-50', text: `Excellent offer acceptance rate of ${offerAccept.toFixed(0)}% — candidates are happy with the offers.` })

  // Technical drop-off
  if (techDropOff > 50) insights.push({ icon: '🟡', color: 'border-amber-200 bg-amber-50', text: `${techDropOff.toFixed(0)}% of HR-cleared candidates are not reaching the Technical round. Consider tightening HR screening.` })

  // Shortlisted with no update
  if (shortlisted > 5) insights.push({ icon: '🔴', color: 'border-red-200 bg-red-50', text: `${shortlisted} candidates are still in "Shortlisted" status. Follow up to avoid losing them to other offers.` })
  else if (shortlisted > 0) insights.push({ icon: '🟡', color: 'border-amber-200 bg-amber-50', text: `${shortlisted} candidate${shortlisted > 1 ? 's' : ''} pending a decision — update their status to keep the pipeline clean.` })

  // Best source
  if (bestSource) insights.push({ icon: '💡', color: 'border-blue-200 bg-blue-50', text: `Best source: ${bestSource[0]} has given you ${bestSource[1].selected} hire${bestSource[1].selected !== 1 ? 's' : ''}. Consider investing more here.` })

  // Attrition
  if (attritionRate > 20) insights.push({ icon: '🔴', color: 'border-red-200 bg-red-50', text: `High early attrition: ${joinedAndLeft} employee${joinedAndLeft !== 1 ? 's' : ''} joined and left. Review onboarding and role clarity.` })

  if (insights.length === 0) insights.push({ icon: '🟢', color: 'border-emerald-200 bg-emerald-50', text: 'Recruitment looks healthy! Keep monitoring for any changes.' })

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200">
      <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Recruitment Health Insights</h2>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className={`flex gap-3 p-3 rounded-xl border ${ins.color}`}>
            <span className="text-base flex-shrink-0">{ins.icon}</span>
            <p className="text-sm text-stone-700 leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmployeeTab({ employees, onRefresh }: { employees: Employee[]; onRefresh: () => void }) {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ name: '', designation: '', department: '', officialEmail: '', contactNo: '', birthDate: '', joiningDate: '', status: 'Confirmed', empCode: '', reportingTo: '', personalEmail: '', bloodGroup: '', maritalStatus: '', education: '', activeStatus: 'Active' })
  const [saving, setSaving] = useState(false)

  const today = new Date()
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const tomorrowDate = new Date(today); tomorrowDate.setDate(today.getDate() + 1)
  const tomorrowMD = `${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`

  const getYears = (dateStr: string) => {
    if (!dateStr) return 0
    const d = new Date(dateStr)
    return today.getFullYear() - d.getFullYear()
  }

  const getMD = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const activeEmps = employees.filter(e => e.activeStatus === 'Active' || e.status === 'Confirmed')
  const birthdays = activeEmps.filter(e => e.birthDate && getMD(e.birthDate) === todayMD)
  const birthdaysTomorrow = activeEmps.filter(e => e.birthDate && getMD(e.birthDate) === tomorrowMD)
  const anniversaries = activeEmps.filter(e => e.joiningDate && getMD(e.joiningDate) === todayMD && getYears(e.joiningDate) > 0)
  const anniversariesTomorrow = activeEmps.filter(e => e.joiningDate && getMD(e.joiningDate) === tomorrowMD && getYears(e.joiningDate) > 0)

  const sendEmail = async (emp: Employee, type: 'birthday' | 'anniversary') => {
    const emailAddr = emp.officialEmail || emp.personalEmail
    if (!emailAddr) { alert('No email found for ' + emp.name); return }
    setSendingEmail(emp.id + type)
    try {
      const res = await fetch('/api/send-birthday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeName: emp.name, employeeEmail: emailAddr, type, years: getYears(emp.joiningDate) })
      })
      if (res.ok) { setEmailSent(emp.id + type); setTimeout(() => setEmailSent(null), 3000) }
      else alert('Failed to send email')
    } catch { alert('Failed to send email') }
    finally { setSendingEmail(null) }
  }

  const openWhatsApp = (emp: Employee, type: 'birthday' | 'anniversary') => {
    const years = getYears(emp.joiningDate)
    const msg = type === 'birthday'
      ? `🎂 *Happy Birthday ${emp.name}!* 🎉\n\nWishing you a wonderful day filled with joy and happiness! Thank you for being an amazing part of the Pixel Mint Media family! 🎊\n\n- Team Pixel Mint Media`
      : `🎉 *Happy Work Anniversary ${emp.name}!* 🎊\n\nCongratulations on completing *${years} year${years > 1 ? 's' : ''}* with Pixel Mint Media! Your dedication and hard work inspire us all. Here's to many more years together! 🚀\n\n- Team Pixel Mint Media`
    window.open(`${WA_GROUP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleAdd = async () => {
    if (!form.name || !form.designation) { alert('Name and designation required'); return }
    setSaving(true)
    try {
      await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      onRefresh(); setShowAddForm(false)
    } catch { alert('Failed to save') }
    finally { setSaving(false) }
  }

  const inp = "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400 bg-stone-50"
  const lbl = "block text-xs text-stone-500 mb-1 font-medium"

  const EventCard = ({ emp, type, tomorrow }: { emp: Employee; type: 'birthday' | 'anniversary'; tomorrow?: boolean }) => {
    const years = type === 'anniversary' ? getYears(emp.joiningDate) : 0
    const isSent = emailSent === emp.id + type
    const isSending = sendingEmail === emp.id + type
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl border ${tomorrow ? 'border-stone-100 bg-stone-50' : type === 'birthday' ? 'border-pink-100 bg-pink-50' : 'border-blue-100 bg-blue-50'}`}>
        <div>
          <p className="text-sm font-medium text-stone-800">{emp.name} {tomorrow && <span className="text-xs text-stone-400">(tomorrow)</span>}</p>
          <p className="text-xs text-stone-500">{emp.designation} · {emp.department}</p>
          {type === 'anniversary' && <p className="text-xs text-blue-600 font-medium">{years} year{years > 1 ? 's' : ''} 🎊</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => openWhatsApp(emp, type)}
            className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 flex items-center gap-1">
            💬 WhatsApp
          </button>
          <button onClick={() => sendEmail(emp, type)} disabled={isSending}
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 ${isSent ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-800 text-white hover:bg-stone-700'}`}>
            {isSending ? '...' : isSent ? '✓ Sent' : '✉ Email'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Today's events */}
      {(birthdays.length > 0 || anniversaries.length > 0) && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">🎉 Today's Celebrations</h2>
          <div className="space-y-2">
            {birthdays.map(e => <EventCard key={e.id + 'b'} emp={e} type="birthday" />)}
            {anniversaries.map(e => <EventCard key={e.id + 'a'} emp={e} type="anniversary" />)}
          </div>
        </div>
      )}

      {/* Tomorrow's events */}
      {(birthdaysTomorrow.length > 0 || anniversariesTomorrow.length > 0) && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">📅 Tomorrow</h2>
          <div className="space-y-2">
            {birthdaysTomorrow.map(e => <EventCard key={e.id + 'bt'} emp={e} type="birthday" tomorrow />)}
            {anniversariesTomorrow.map(e => <EventCard key={e.id + 'at'} emp={e} type="anniversary" tomorrow />)}
          </div>
        </div>
      )}

      {birthdays.length === 0 && anniversaries.length === 0 && birthdaysTomorrow.length === 0 && anniversariesTomorrow.length === 0 && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200 text-center text-stone-400 text-sm py-8">
          No birthdays or anniversaries today or tomorrow 🎈
        </div>
      )}

      {/* Employee list */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Active Employees ({activeEmps.length})</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="text-xs bg-stone-800 text-white px-3 py-1.5 rounded-lg">+ Add Employee</button>
        </div>

        {showAddForm && (
          <div className="p-5 border-b border-stone-100 bg-stone-50 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className={lbl}>Name *</label><input className={inp} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><label className={lbl}>Designation *</label><input className={inp} value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></div>
            <div><label className={lbl}>Department</label><input className={inp} value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
            <div><label className={lbl}>Official Email</label><input className={inp} type="email" value={form.officialEmail} onChange={e => setForm({...form, officialEmail: e.target.value})} /></div>
            <div><label className={lbl}>Contact No</label><input className={inp} value={form.contactNo} onChange={e => setForm({...form, contactNo: e.target.value})} /></div>
            <div><label className={lbl}>Birth Date</label><input className={inp} type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} /></div>
            <div><label className={lbl}>Joining Date</label><input className={inp} type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} /></div>
            <div><label className={lbl}>Reporting To</label><input className={inp} value={form.reportingTo} onChange={e => setForm({...form, reportingTo: e.target.value})} /></div>
            <div className="flex items-end gap-2">
              <button onClick={handleAdd} disabled={saving} className="flex-1 bg-stone-800 text-white text-xs py-2 rounded-lg">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setShowAddForm(false)} className="flex-1 border border-stone-200 text-xs py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {['Name','Designation','Department','Birthday','Anniversary','Email','Contact'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeEmps.map((e, i) => (
                <tr key={i} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="px-4 py-3"><p className="font-medium text-stone-800">{e.name}</p></td>
                  <td className="px-4 py-3 text-stone-600 text-xs">{e.designation}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{e.department}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{e.birthDate ? new Date(e.birthDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{e.joiningDate ? new Date(e.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs truncate max-w-36">{e.officialEmail || '—'}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{e.contactNo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AddCandidateModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', position: '', department: '',
    education: '', location: '', totalExperience: '', relevantExperience: '',
    source: '', sourceDetails: '', interviewDate: '', hrInterview: '',
    technicalRound: '', finalRound: '', finalStatus: 'Shortlisted',
    offeredCTC: '', doj: '', offerAccepted: '', joined: '', reasonNotJoining: '',
    monthYear: ''
  })
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const [cvFileName, setCvFileName] = useState('')
  const [parseSuccess, setParseSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file only'); return }
    setCvFileName(file.name)
    setParsing(true)
    setError('')
    setParseSuccess(false)
    try {
      const fd = new FormData()
      fd.append('cv', file)
      const res = await fetch('/api/parse-cv', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data.candidate) {
        const c = data.candidate
        setForm(prev => {
          const updated = {
            ...prev,
            name: (c.name && c.name.trim()) ? c.name.trim() : prev.name,
            email: (c.email && c.email.trim()) ? c.email.trim() : prev.email,
            phone: (c.phone && c.phone.trim()) ? c.phone.trim() : prev.phone,
            education: (c.education && c.education.trim()) ? c.education.trim() : prev.education,
            location: (c.location && c.location.trim()) ? c.location.trim() : prev.location,
            totalExperience: (c.totalExperience && c.totalExperience.trim()) ? c.totalExperience.trim() : prev.totalExperience,
            relevantExperience: (c.relevantExperience && c.relevantExperience.trim()) ? c.relevantExperience.trim() : prev.relevantExperience,
            position: (c.position && c.position.trim()) ? c.position.trim() : prev.position,
          }
          return updated
        })
        setParseSuccess(true)
      } else {
        setError('CV was read but no details could be extracted. Please fill in manually.')
      }
    } catch {
      setError('Could not read CV automatically. Please fill in the details manually.')
    } finally {
      setParsing(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Candidate name is required'); return }
    if (!form.position.trim()) { setError('Position is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/add-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monthYear: form.interviewDate ? form.interviewDate.substring(0, 7) : '' })
      })
      if (!res.ok) throw new Error('Failed')
      onAdded()
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inp = "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400 bg-stone-50"
  const lbl = "block text-xs text-stone-500 mb-1 font-medium"

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-stone-800">Add New Candidate</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
        </div>
        <div className="px-6 pt-5 pb-2">
          <div onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${parsing ? 'border-blue-300 bg-blue-50' : parseSuccess ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 hover:border-stone-400 bg-stone-50'}`}>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleCVUpload} />
            {parsing ? (
              <div>
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-blue-600 font-medium">AI is reading your CV...</p>
                <p className="text-xs text-blue-400 mt-1">Extracting candidate details automatically</p>
              </div>
            ) : parseSuccess ? (
              <div>
                <p className="text-2xl mb-1">✅</p>
                <p className="text-sm text-emerald-700 font-medium">CV read successfully!</p>
                <p className="text-xs text-emerald-500 mt-1">{cvFileName} — Review and complete the details below</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl mb-1">📄</p>
                <p className="text-sm text-stone-600 font-medium">Upload CV (PDF) for auto-fill</p>
                <p className="text-xs text-stone-400 mt-1">AI will extract name, email, education, experience automatically</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className={lbl}>Full Name *</label><input className={inp} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Priya Sharma" /></div>
          <div><label className={lbl}>Email</label><input className={inp} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="priya@email.com" /></div>
          <div><label className={lbl}>Phone</label><input className={inp} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" /></div>
          <div><label className={lbl}>Position Applied *</label><input className={inp} value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="e.g. Campaign Manager" /></div>
          <div><label className={lbl}>Department</label>
            <select className={inp} value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
              <option value="">Select...</option>
              {['Business Development','Marketing','Campaign Management','Accounts & Finance','Biddable Media','Client Servicing'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Highest Education</label><input className={inp} value={form.education} onChange={e => setForm({...form, education: e.target.value})} placeholder="e.g. MBA, B.Com, B.Tech" /></div>
          <div><label className={lbl}>Current Location</label><input className={inp} value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Mumbai" /></div>
          <div><label className={lbl}>Total Experience</label><input className={inp} value={form.totalExperience} onChange={e => setForm({...form, totalExperience: e.target.value})} placeholder="e.g. 3 years" /></div>
          <div><label className={lbl}>Relevant Experience</label><input className={inp} value={form.relevantExperience} onChange={e => setForm({...form, relevantExperience: e.target.value})} placeholder="e.g. 2 years" /></div>
          <div><label className={lbl}>Source</label>
            <select className={inp} value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
              <option value="">Select...</option>
              {['Portal','Job Portal','Institute','Consultancy','Reference','Social Media','Employee Reference','Personal Reference'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Source Details</label><input className={inp} value={form.sourceDetails} onChange={e => setForm({...form, sourceDetails: e.target.value})} placeholder="e.g. LinkedIn, Naukri, Name" /></div>
          <div><label className={lbl}>Interview Date</label><input className={inp} type="date" value={form.interviewDate} onChange={e => setForm({...form, interviewDate: e.target.value})} /></div>
          <div><label className={lbl}>HR Interviewer</label><input className={inp} value={form.hrInterview} onChange={e => setForm({...form, hrInterview: e.target.value})} placeholder="e.g. Ketaki Vaidya" /></div>
          <div><label className={lbl}>Technical Round Interviewer</label><input className={inp} value={form.technicalRound} onChange={e => setForm({...form, technicalRound: e.target.value})} placeholder="Name or leave blank" /></div>
          <div><label className={lbl}>Culture Round Interviewer</label><input className={inp} value={form.finalRound} onChange={e => setForm({...form, finalRound: e.target.value})} placeholder="Name or leave blank" /></div>
          <div><label className={lbl}>Current Status</label>
            <select className={inp} value={form.finalStatus} onChange={e => setForm({...form, finalStatus: e.target.value})}>
              {['Shortlisted','Selected','Rejected','Joined & Left'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Offered CTC (₹)</label><input className={inp} value={form.offeredCTC} onChange={e => setForm({...form, offeredCTC: e.target.value})} placeholder="e.g. 50000" /></div>
          <div><label className={lbl}>Date of Joining</label><input className={inp} type="date" value={form.doj} onChange={e => setForm({...form, doj: e.target.value})} /></div>
          <div><label className={lbl}>Offer Accepted?</label>
            <select className={inp} value={form.offerAccepted} onChange={e => setForm({...form, offerAccepted: e.target.value})}>
              <option value="">-</option><option>Yes</option><option>No</option><option>Pending</option>
            </select>
          </div>
          <div><label className={lbl}>Joined?</label>
            <select className={inp} value={form.joined} onChange={e => setForm({...form, joined: e.target.value})}>
              <option value="">-</option><option>Yes</option><option>No</option><option>Pending</option>
            </select>
          </div>
          <div className="col-span-2"><label className={lbl}>Reason for Not Joining</label><input className={inp} value={form.reasonNotJoining} onChange={e => setForm({...form, reasonNotJoining: e.target.value})} placeholder="e.g. High salary expectations, Got another offer..." /></div>
        </div>
        {error && <p className="px-6 pb-2 text-red-500 text-sm">{error}</p>}
        <div className="p-6 pt-2 flex gap-3 justify-end border-t border-stone-100">
          <button onClick={onClose} className="px-5 py-2 text-sm text-stone-500 hover:text-stone-700">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Candidate'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TimeChart({ candidates }: { candidates: Candidate[] }) {
  type ViewType = 'fy' | 'quarterly' | 'monthly'
  const [view, setView] = useState<ViewType>('fy')
  const [selectedFY, setSelectedFY] = useState<string | null>(null)
  const [selectedQ, setSelectedQ] = useState<string | null>(null)

  // FY = Apr to Mar, e.g. FY 2024-25 means Apr 2024 - Mar 2025
  const getFY = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const yr = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1
    return `FY ${yr}-${String(yr + 1).slice(2)}`
  }

  const getFYQuarter = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const m = d.getMonth() // 0-11
    // Q1: Apr-Jun (3-5), Q2: Jul-Sep (6-8), Q3: Oct-Dec (9-11), Q4: Jan-Mar (0-2)
    const q = m >= 3 && m <= 5 ? 'Q1' : m >= 6 && m <= 8 ? 'Q2' : m >= 9 && m <= 11 ? 'Q3' : 'Q4'
    const yr = m >= 3 ? d.getFullYear() : d.getFullYear() - 1
    return `${q} FY${yr}-${String(yr + 1).slice(2)}`
  }

  const getMonth = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return d.toLocaleString('default', { month: 'short', year: '2-digit' })
  }

  type GroupEntry = { received: number; hr: number; technical: number; selected: number; date: Date }
  const grouped: Record<string, GroupEntry> = {}

  const validCandidates = candidates.filter(c => c.interviewDate && c.interviewDate.length >= 7)

  validCandidates.forEach(c => {
    let key: string | null = null
    if (view === 'fy') key = getFY(c.interviewDate)
    else if (view === 'quarterly') {
      const q = getFYQuarter(c.interviewDate)
      const fy = getFY(c.interviewDate)
      if (selectedFY && fy !== selectedFY) return
      key = q
    } else {
      const q = getFYQuarter(c.interviewDate)
      const fy = getFY(c.interviewDate)
      if (selectedFY && fy !== selectedFY) return
      if (selectedQ && q !== selectedQ) return
      key = getMonth(c.interviewDate)
    }
    if (!key) return
    if (!grouped[key]) grouped[key] = { received: 0, hr: 0, technical: 0, selected: 0, date: new Date(c.interviewDate) }
    grouped[key].received++
    if (c.hrInterview) grouped[key].hr++
    if (c.technicalRound) grouped[key].technical++
    if (c.finalStatus === 'Selected') grouped[key].selected++
  })

  const sortedKeys = Object.keys(grouped).sort((a, b) => grouped[a].date.getTime() - grouped[b].date.getTime())
  const maxVal = Math.max(...sortedKeys.map(k => grouped[k].received), 1)

  const bars = [
    { key: 'received', label: 'CV Received', color: '#3b82f6' },
    { key: 'hr', label: 'HR Round', color: '#8b5cf6' },
    { key: 'technical', label: 'Technical', color: '#f59e0b' },
    { key: 'selected', label: 'Selected', color: '#10b981' },
  ]

  // Get all FYs for breadcrumb
  const allFYs = Array.from(new Set(validCandidates.map(c => getFY(c.interviewDate)).filter(Boolean))).sort()
  const allFYQuarters = selectedFY ? Array.from(new Set(validCandidates.filter(c => getFY(c.interviewDate) === selectedFY).map(c => getFYQuarter(c.interviewDate)).filter(Boolean))).sort() : []

  const handleBarClick = (key: string) => {
    if (view === 'fy') {
      setSelectedFY(key)
      setView('quarterly')
    } else if (view === 'quarterly') {
      setSelectedQ(key)
      setView('monthly')
    }
  }

  if (sortedKeys.length === 0) return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 text-center text-stone-400 text-sm py-16">
      No dated interviews found to display trends
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest">Recruitment Trends</h2>
        <div className="flex border border-stone-200 rounded-lg overflow-hidden">
          <button onClick={() => { setView('fy'); setSelectedFY(null); setSelectedQ(null) }}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${view === 'fy' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>
            Financial Year
          </button>
          <button onClick={() => setView('quarterly')}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${view === 'quarterly' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>
            Quarterly
          </button>
          <button onClick={() => setView('monthly')}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${view === 'monthly' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>
            Monthly
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-xs text-stone-400">
        <button onClick={() => { setView('fy'); setSelectedFY(null); setSelectedQ(null) }}
          className={`hover:text-stone-600 ${view === 'fy' ? 'text-stone-700 font-medium' : ''}`}>
          All Years
        </button>
        {selectedFY && <>
          <span>›</span>
          <button onClick={() => { setView('quarterly'); setSelectedQ(null) }}
            className={`hover:text-stone-600 ${view === 'quarterly' ? 'text-stone-700 font-medium' : ''}`}>
            {selectedFY}
          </button>
        </>}
        {selectedQ && <>
          <span>›</span>
          <span className="text-stone-700 font-medium">{selectedQ}</span>
        </>}
        {view !== 'fy' && <span className="text-stone-300 ml-1">(click a bar to drill down)</span>}
      </div>

      {view === 'fy' && <p className="text-xs text-stone-400 mb-4">April – March financial year. Click any bar to see quarterly breakdown.</p>}
      {view === 'quarterly' && <p className="text-xs text-stone-400 mb-4">Q1: Apr–Jun · Q2: Jul–Sep · Q3: Oct–Dec · Q4: Jan–Mar. Click any bar to see monthly breakdown.</p>}

      <div className="flex flex-wrap gap-4 mb-5">
        {bars.map(b => (
          <span key={b.key} className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: b.color }}></span>{b.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${sortedKeys.length * 80}px` }}>
          <div className="flex items-end gap-2" style={{ height: '200px' }}>
            {sortedKeys.map(key => (
              <div key={key} className={`flex-1 flex flex-col items-center ${view !== 'monthly' ? 'cursor-pointer group' : ''}`}
                onClick={() => handleBarClick(key)}>
                <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: '175px' }}>
                  {bars.map(b => {
                    const val = grouped[key][b.key as keyof GroupEntry] as number
                    const h = Math.max((val / maxVal) * 155, val > 0 ? 3 : 0)
                    return <div key={b.key} className="flex-1 rounded-t-sm group-hover:opacity-100 transition-opacity"
                      style={{ height: `${h}px`, background: b.color, opacity: 0.8 }}
                      title={`${b.label}: ${val}`}></div>
                  })}
                </div>
                <span className="text-xs text-stone-400 whitespace-nowrap mt-1 group-hover:text-stone-600">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left py-2 text-stone-400 font-medium">Period</th>
              {bars.map(b => <th key={b.key} className="text-right py-2 font-medium" style={{ color: b.color }}>{b.label}</th>)}
              <th className="text-right py-2 text-stone-400 font-medium">Conversion %</th>
            </tr>
          </thead>
          <tbody>
            {sortedKeys.map(key => {
              const d = grouped[key]
              const conv = d.received > 0 ? ((d.selected / d.received) * 100).toFixed(0) : '0'
              return (
                <tr key={key} className={`border-b border-stone-50 ${view !== 'monthly' ? 'cursor-pointer hover:bg-stone-50' : ''}`}
                  onClick={() => handleBarClick(key)}>
                  <td className="py-2 text-stone-700 font-medium">{key}</td>
                  <td className="py-2 text-right text-stone-600">{d.received}</td>
                  <td className="py-2 text-right text-stone-600">{d.hr}</td>
                  <td className="py-2 text-right text-stone-600">{d.technical}</td>
                  <td className="py-2 text-right font-semibold text-emerald-600">{d.selected}</td>
                  <td className="py-2 text-right text-stone-400">{conv}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trends' | 'candidates' | 'employees'>('dashboard')
  const [sendingOffer, setSendingOffer] = useState<string | null>(null)
  const [offerSent, setOfferSent] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    try {
      setError('')
      const [candRes, empRes] = await Promise.all([
        fetch('/api/candidates'),
        fetch('/api/employees')
      ])
      if (candRes.ok) { const d = await candRes.json(); setCandidates(d.candidates || []) }
      if (empRes.ok) { const d = await empRes.json(); setEmployees(d.employees || []) }
    } catch {
      setError('Could not load data. Check your Google Sheet connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const sendOfferEmail = async (c: Candidate) => {
    if (!c.email) { alert('No email found for this candidate'); return }
    setSendingOffer(c.id)
    try {
      const res = await fetch('/api/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateName: c.name, candidateEmail: c.email, position: c.position, department: c.department, offeredCTC: c.offeredCTC, joiningDate: c.doj })
      })
      if (res.ok) { setOfferSent(c.id); setTimeout(() => setOfferSent(null), 4000) }
      else alert('Failed to send offer email')
    } catch { alert('Failed to send offer email') }
    finally { setSendingOffer(null) }
  }

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const filtered = candidates.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.position.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.finalStatus === filterStatus
    const matchDept = filterDept === 'all' || c.department === filterDept
    return matchSearch && matchStatus && matchDept
  })

  const total = candidates.length
  const selected = candidates.filter(c => c.finalStatus === 'Selected').length
  const shortlisted = candidates.filter(c => c.finalStatus === 'Shortlisted').length
  const rejected = candidates.filter(c => c.finalStatus === 'Rejected').length
  const joined = candidates.filter(c => c.joined === 'Yes').length
  const joinedAndLeft = candidates.filter(c => c.finalStatus === 'Joined & Left').length
  const offered = candidates.filter(c => c.offeredCTC && c.offeredCTC !== '').length
  const selectedToJoinedRatio = selected > 0 ? ((joined / selected) * 100).toFixed(0) : '0'
  const offeredToJoinedRatio = offered > 0 ? ((joined / offered) * 100).toFixed(0) : '0'
  const hrRound = candidates.filter(c => c.hrInterview).length
  const technical = candidates.filter(c => c.technicalRound).length
  const culture = candidates.filter(c => c.finalRound).length

  const deptCounts = candidates.reduce((acc, c) => { if (c.department) acc[c.department] = (acc[c.department] || 0) + 1; return acc }, {} as Record<string, number>)
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])
  const sourceCounts = candidates.reduce((acc, c) => { if (c.source) acc[c.source] = (acc[c.source] || 0) + 1; return acc }, {} as Record<string, number>)
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])

  // Source quality — selected per source
  const sourceQuality = candidates.reduce((acc, c) => {
    if (!c.source) return acc
    if (!acc[c.source]) acc[c.source] = { total: 0, selected: 0 }
    acc[c.source].total++
    if (c.finalStatus === 'Selected') acc[c.source].selected++
    return acc
  }, {} as Record<string, { total: number; selected: number }>)
  const topSourceQuality = Object.entries(sourceQuality)
    .map(([src, d]) => ({ src, ...d, rate: d.total > 0 ? (d.selected / d.total) * 100 : 0 }))
    .sort((a, b) => b.selected - a.selected)

  const depts = Array.from(new Set(candidates.map(c => c.department).filter(Boolean)))

  const funnelData = [
    { stage: 'HR Round', count: hrRound, color: '#8b5cf6' },
    { stage: 'Technical Round', count: technical, color: '#f59e0b' },
    { stage: 'Culture Round', count: culture, color: '#ec4899' },
    { stage: 'Selected', count: selected, color: '#10b981' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-stone-400 text-sm">Loading recruitment data...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      {showModal && <AddCandidateModal onClose={() => setShowModal(false)} onAdded={fetchCandidates} />}
      <header className="bg-white border-b border-stone-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Pixel Mint Media" style={{height:'36px', width:'auto'}} />
            <div>
              <h1 className="text-lg font-semibold text-stone-800">PMM Recruitment</h1>
              <p className="text-xs text-stone-400">{total} candidates tracked</p>
            </div>
            <nav className="flex gap-1 ml-6 border border-stone-200 rounded-lg p-1">
              {(['dashboard', 'trends', 'candidates', 'employees'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm rounded-md capitalize transition-all ${activeTab === tab ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchCandidates} className="text-xs text-stone-400 hover:text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5">↻ Refresh</button>
            <button onClick={() => setShowModal(true)} className="bg-stone-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors">+ Add Candidate</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">⚠️ {error}</div>}

        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* Top stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-medium">Total Interviewed</p>
                <p className="text-3xl font-semibold text-stone-800">{total}</p>
                <p className="text-xs text-stone-400 mt-1">{shortlisted} in pipeline</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-medium">Selected</p>
                <p className="text-3xl font-semibold text-emerald-600">{selected}</p>
                <p className="text-xs text-stone-400 mt-1">{rejected} rejected</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-medium">Selected → Joined</p>
                <p className="text-3xl font-semibold text-blue-600">{selectedToJoinedRatio}%</p>
                <p className="text-xs text-stone-400 mt-1">{joined} of {selected} joined</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-medium">Offered → Joined</p>
                <p className="text-3xl font-semibold text-violet-600">{offeredToJoinedRatio}%</p>
                <p className="text-xs text-stone-400 mt-1">{joined} of {offered} offered · {joinedAndLeft} joined & left</p>
              </div>
            </div>

            {/* Pipeline + Source quality side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Interview Pipeline</h2>
                <div className="space-y-3">
                  {funnelData.map(({ stage, count, color }) => {
                    const pct = hrRound > 0 ? (count / hrRound) * 100 : 0
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <span className="text-sm text-stone-500 w-32 flex-shrink-0">{stage}</span>
                        <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
                          <div className="h-full rounded-full flex items-center px-2.5" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}>
                            <span className="text-white text-xs font-medium">{count > 0 ? count : ''}</span>
                          </div>
                        </div>
                        <span className="text-xs text-stone-400 w-8 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-stone-300 mt-4">% relative to HR Round interviews ({hrRound})</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Source Performance</h2>
                <div className="space-y-3">
                  {topSourceQuality.slice(0, 6).map(({ src, total: t, selected: s, rate }) => (
                    <div key={src} className="flex items-center gap-3">
                      <span className="text-sm text-stone-600 flex-1 truncate">{src}</span>
                      <span className="text-xs text-stone-400">{t} CVs</span>
                      <span className="text-xs font-medium text-emerald-600 w-16 text-right">{s} selected</span>
                      <span className={`text-xs font-semibold w-10 text-right ${rate >= 20 ? 'text-emerald-600' : rate >= 10 ? 'text-amber-500' : 'text-stone-400'}`}>{rate.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-stone-300 mt-4">Selection rate per source</p>
              </div>
            </div>

            {/* Department breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">By Department</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topDept.map(([dept, count]) => {
                  const deptSelected = candidates.filter(c => c.department === dept && c.finalStatus === 'Selected').length
                  const deptJoined = candidates.filter(c => c.department === dept && c.joined === 'Yes').length
                  return (
                    <div key={dept} className="border border-stone-100 rounded-xl p-4">
                      <p className="text-sm font-medium text-stone-700 mb-2 truncate">{dept}</p>
                      <div className="flex gap-4 text-xs">
                        <div><span className="text-stone-400">Interviewed </span><span className="font-semibold text-stone-700">{count}</span></div>
                        <div><span className="text-stone-400">Selected </span><span className="font-semibold text-emerald-600">{deptSelected}</span></div>
                        <div><span className="text-stone-400">Joined </span><span className="font-semibold text-blue-600">{deptJoined}</span></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Insights */}
            <InsightsPanel candidates={candidates} />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-5">
            {/* Management summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Funnel Health</p>
                <p className="text-2xl font-semibold text-stone-800">{hrRound > 0 ? ((selected/hrRound)*100).toFixed(0) : 0}%</p>
                <p className="text-xs text-stone-400 mt-1">HR → Selected rate</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Offer Acceptance</p>
                <p className="text-2xl font-semibold text-emerald-600">{offeredToJoinedRatio}%</p>
                <p className="text-xs text-stone-400 mt-1">{joined} joined of {offered} offered</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Best Source</p>
                <p className="text-lg font-semibold text-stone-800 truncate">{topSourceQuality[0]?.src || '—'}</p>
                <p className="text-xs text-stone-400 mt-1">{topSourceQuality[0]?.selected || 0} hires · {topSourceQuality[0]?.rate.toFixed(0) || 0}% rate</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-200">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Attrition</p>
                <p className="text-2xl font-semibold text-orange-500">{joinedAndLeft}</p>
                <p className="text-xs text-stone-400 mt-1">Joined & Left · {joined > 0 ? ((joinedAndLeft/joined)*100).toFixed(0) : 0}% of joiners</p>
              </div>
            </div>
            <TimeChart candidates={candidates} />
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or position..."
                className="border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-stone-400 bg-white flex-1 min-w-48" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-600 focus:outline-none">
                <option value="all">All Status</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Joined & Left">Joined & Left</option>
              </select>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-600 focus:outline-none">
                <option value="all">All Departments</option>
                {depts.map(d => <option key={d}>{d}</option>)}
              </select>
              <span className="text-sm text-stone-400 flex items-center">{filtered.length} results</span>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {['Name','Position','Department','Education','Experience','Source','Interview Date','HR Round','Technical','Culture','Status','CTC','Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={13} className="text-center py-12 text-stone-400">No candidates found</td></tr>
                    ) : filtered.map((c, i) => (
                      <tr key={i} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3"><div className="font-medium text-stone-800">{c.name}</div>{c.email && <div className="text-xs text-stone-400 truncate max-w-32">{c.email}</div>}</td>
                        <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{c.position}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.department}</td>
                        <td className="px-4 py-3 text-stone-500">{c.education || '—'}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.totalExperience || '—'}</td>
                        <td className="px-4 py-3 text-stone-500">{c.source || '—'}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.interviewDate ? c.interviewDate.substring(0,10) : '—'}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.hrInterview || '—'}</td>
                        <td className="px-4 py-3 text-stone-500">{c.technicalRound || '—'}</td>
                        <td className="px-4 py-3 text-stone-500">{c.finalRound || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.finalStatus] || 'bg-stone-100 text-stone-600'}`}>{c.finalStatus || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.offeredCTC ? `₹${Number(c.offeredCTC).toLocaleString('en-IN')}` : '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {c.finalStatus === 'Selected' && c.email && (
                            <button onClick={() => sendOfferEmail(c)} disabled={sendingOffer === c.id}
                              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${offerSent === c.id ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-800 text-white hover:bg-stone-700'}`}>
                              {sendingOffer === c.id ? '...' : offerSent === c.id ? '✓ Sent' : '✉ Offer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <EmployeeTab employees={employees} onRefresh={fetchCandidates} />
        )}
      </main>
    </div>
  )
}

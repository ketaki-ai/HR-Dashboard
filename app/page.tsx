'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

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
        setForm(prev => ({
          ...prev,
          name: data.candidate.name || prev.name,
          email: data.candidate.email || prev.email,
          phone: data.candidate.phone || prev.phone,
          education: data.candidate.education || prev.education,
          location: data.candidate.location || prev.location,
          totalExperience: data.candidate.totalExperience || prev.totalExperience,
          relevantExperience: data.candidate.relevantExperience || prev.relevantExperience,
          position: data.candidate.position || prev.position,
        }))
        setParseSuccess(true)
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
              {['Shortlisted','Selected','Rejected'].map(s => <option key={s}>{s}</option>)}
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
  const [view, setView] = useState<'monthly' | 'quarterly'>('monthly')

  const getQuarter = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`
  }

  const getMonth = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return d.toLocaleString('default', { month: 'short', year: '2-digit' })
  }

  const grouped: Record<string, { received: number; hr: number; technical: number; selected: number; date: Date }> = {}

  candidates.filter(c => c.interviewDate && c.interviewDate.length >= 7).forEach(c => {
    const key = view === 'monthly' ? getMonth(c.interviewDate) : getQuarter(c.interviewDate)
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

  if (sortedKeys.length === 0) return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 text-center text-stone-400 text-sm py-16">
      No dated interviews found to display trends
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest">Recruitment Over Time</h2>
        <div className="flex border border-stone-200 rounded-lg overflow-hidden">
          <button onClick={() => setView('monthly')} className={`px-4 py-1.5 text-xs font-medium transition-all ${view === 'monthly' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>Monthly</button>
          <button onClick={() => setView('quarterly')} className={`px-4 py-1.5 text-xs font-medium transition-all ${view === 'quarterly' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>Quarterly</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-5">
        {bars.map(b => (
          <span key={b.key} className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: b.color }}></span>{b.label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${sortedKeys.length * 72}px` }}>
          <div className="flex items-end gap-1.5" style={{ height: '200px' }}>
            {sortedKeys.map(key => (
              <div key={key} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: '175px' }}>
                  {bars.map(b => {
                    const val = grouped[key][b.key as keyof typeof grouped[typeof key]] as number
                    const h = Math.max((val / maxVal) * 155, val > 0 ? 3 : 0)
                    return <div key={b.key} className="flex-1 rounded-t-sm" style={{ height: `${h}px`, background: b.color, opacity: 0.85 }} title={`${b.label}: ${val}`}></div>
                  })}
                </div>
                <span className="text-xs text-stone-400 whitespace-nowrap mt-1">{key}</span>
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
                <tr key={key} className="border-b border-stone-50">
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trends' | 'candidates'>('dashboard')

  const fetchCandidates = useCallback(async () => {
    try {
      setError('')
      const res = await fetch('/api/candidates')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setCandidates(data.candidates || [])
    } catch {
      setError('Could not load candidates. Check your Google Sheet connection.')
    } finally {
      setLoading(false)
    }
  }, [])

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
  const conversionRate = total > 0 ? ((selected / total) * 100).toFixed(1) : '0'

  const deptCounts = candidates.reduce((acc, c) => { if (c.department) acc[c.department] = (acc[c.department] || 0) + 1; return acc }, {} as Record<string, number>)
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])
  const sourceCounts = candidates.reduce((acc, c) => { if (c.source) acc[c.source] = (acc[c.source] || 0) + 1; return acc }, {} as Record<string, number>)
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])
  const depts = Array.from(new Set(candidates.map(c => c.department).filter(Boolean)))
  const funnelData = [
    { stage: 'CV Received', count: total, color: '#3b82f6' },
    { stage: 'HR Round', count: candidates.filter(c => c.hrInterview).length, color: '#8b5cf6' },
    { stage: 'Technical Round', count: candidates.filter(c => c.technicalRound).length, color: '#f59e0b' },
    { stage: 'Culture Round', count: candidates.filter(c => c.finalRound).length, color: '#ec4899' },
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
            <div>
              <h1 className="text-lg font-semibold text-stone-800">PMM Recruitment</h1>
              <p className="text-xs text-stone-400">{total} candidates tracked</p>
            </div>
            <nav className="flex gap-1 ml-6 border border-stone-200 rounded-lg p-1">
              {(['dashboard', 'trends', 'candidates'] as const).map(tab => (
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Total Candidates" value={total} />
              <StatCard label="Selected" value={selected} color="text-emerald-600" sub={`${conversionRate}% conversion`} />
              <StatCard label="Shortlisted" value={shortlisted} color="text-amber-600" sub="In pipeline" />
              <StatCard label="Rejected" value={rejected} color="text-red-500" />
              <StatCard label="Joined" value={joined} color="text-blue-600" sub="Confirmed" />
              <StatCard label="Conversion" value={`${conversionRate}%`} color="text-violet-600" sub="CV to Hired" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest mb-5">Recruitment Pipeline</h2>
              <div className="space-y-3">
                {funnelData.map(({ stage, count, color }) => {
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={stage} className="flex items-center gap-4">
                      <span className="text-sm text-stone-500 w-36 flex-shrink-0">{stage}</span>
                      <div className="flex-1 bg-stone-100 rounded-full h-6 overflow-hidden">
                        <div className="h-full rounded-full flex items-center px-3" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}>
                          <span className="text-white text-xs font-medium">{count > 0 ? count : ''}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-stone-600 w-10 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest mb-5">By Department</h2>
                <div className="space-y-3">
                  {topDept.map(([dept, count]) => (
                    <div key={dept} className="flex items-center gap-3">
                      <span className="text-sm text-stone-600 flex-1 truncate">{dept}</span>
                      <div className="w-32 bg-stone-100 rounded-full h-2"><div className="h-2 bg-blue-400 rounded-full" style={{ width: `${(count / total) * 100}%` }}></div></div>
                      <span className="text-sm font-medium text-stone-600 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest mb-5">By Source</h2>
                <div className="space-y-3">
                  {topSources.map(([src, count]) => (
                    <div key={src} className="flex items-center gap-3">
                      <span className="text-sm text-stone-600 flex-1 truncate">{src}</span>
                      <div className="w-32 bg-stone-100 rounded-full h-2"><div className="h-2 bg-violet-400 rounded-full" style={{ width: `${(count / total) * 100}%` }}></div></div>
                      <span className="text-sm font-medium text-stone-600 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && <TimeChart candidates={candidates} />}

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
                      {['Name','Position','Department','Education','Experience','Source','Interview Date','HR Round','Technical','Culture','Status','CTC'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={12} className="text-center py-12 text-stone-400">No candidates found</td></tr>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

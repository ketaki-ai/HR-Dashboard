'use client'
import { useState, useEffect, useCallback } from 'react'

interface Candidate {
  id: string; name: string; email: string; phone: string
  position: string; department: string; education: string; location: string
  totalExperience: string; relevantExperience: string; source: string
  sourceDetails: string; interviewDate: string; monthYear: string
  hrInterview: string; technicalRound: string; finalRound: string
  finalStatus: string; offeredCTC: string; doj: string
  offerAccepted: string; joined: string; reasonNotJoining: string
}

const STAGES = ['CV Received', 'HR Round', 'Technical Round', 'Culture Round', 'Selected']
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
  const [error, setError] = useState('')

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
        <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-stone-800">Add New Candidate</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
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
          <div className="col-span-2"><label className={lbl}>Reason for Not Joining (if applicable)</label><input className={inp} value={form.reasonNotJoining} onChange={e => setForm({...form, reasonNotJoining: e.target.value})} placeholder="e.g. High salary expectations, Got another offer..." /></div>
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

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates'>('dashboard')

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

  const deptCounts = candidates.reduce((acc, c) => {
    if (c.department) acc[c.department] = (acc[c.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])

  const sourceCounts = candidates.reduce((acc, c) => {
    if (c.source) acc[c.source] = (acc[c.source] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])

  const depts = [...new Set(candidates.map(c => c.department).filter(Boolean))]

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

      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-stone-800">PMM Recruitment</h1>
              <p className="text-xs text-stone-400">{total} candidates tracked</p>
            </div>
            <nav className="flex gap-1 ml-6 border border-stone-200 rounded-lg p-1">
              {(['dashboard', 'candidates'] as const).map(tab => (
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
            ⚠️ {error} — <a href="#setup" className="underline">See setup instructions below</a>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard label="Total Candidates" value={total} />
              <StatCard label="Selected" value={selected} color="text-emerald-600" sub={`${conversionRate}% conversion`} />
              <StatCard label="Shortlisted" value={shortlisted} color="text-amber-600" sub="In pipeline" />
              <StatCard label="Rejected" value={rejected} color="text-red-500" />
              <StatCard label="Joined" value={joined} color="text-blue-600" sub="Confirmed" />
              <StatCard label="Conversion" value={`${conversionRate}%`} color="text-violet-600" sub="CV → Hired" />
            </div>

            {/* Pipeline Funnel */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest mb-5">Recruitment Pipeline</h2>
              <div className="space-y-3">
                {funnelData.map(({ stage, count, color }) => {
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={stage} className="flex items-center gap-4">
                      <span className="text-sm text-stone-500 w-36 flex-shrink-0">{stage}</span>
                      <div className="flex-1 bg-stone-100 rounded-full h-6 overflow-hidden">
                        <div className="h-full rounded-full flex items-center px-3 transition-all duration-700"
                          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}>
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
              {/* By Department */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest mb-5">By Department</h2>
                <div className="space-y-3">
                  {topDept.map(([dept, count]) => (
                    <div key={dept} className="flex items-center gap-3">
                      <span className="text-sm text-stone-600 flex-1 truncate">{dept}</span>
                      <div className="w-32 bg-stone-100 rounded-full h-2">
                        <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${(count / total) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-stone-600 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Source */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-widest mb-5">By Source</h2>
                <div className="space-y-3">
                  {topSources.map(([src, count]) => (
                    <div key={src} className="flex items-center gap-3">
                      <span className="text-sm text-stone-600 flex-1 truncate">{src}</span>
                      <div className="w-32 bg-stone-100 rounded-full h-2">
                        <div className="h-2 bg-violet-400 rounded-full" style={{ width: `${(count / total) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-stone-600 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Setup Instructions */}
            <div id="setup" className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-amber-800 uppercase tracking-widest mb-3">⚙️ Setup Required</h2>
              <div className="text-sm text-amber-900 space-y-2">
                <p className="font-medium">To connect this dashboard to your Google Sheet, add these to Vercel Environment Variables:</p>
                <div className="font-mono bg-amber-100 rounded-lg p-3 text-xs space-y-1">
                  <p><strong>GOOGLE_SHEET_ID</strong> = your Google Sheet ID (from the URL)</p>
                  <p><strong>GOOGLE_SERVICE_ACCOUNT_KEY</strong> = your service account JSON key</p>
                </div>
                <p className="text-xs text-amber-700">See the README.md file included in your download for step-by-step instructions.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or position..."
                className="border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-stone-400 bg-white flex-1 min-w-48" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-600 focus:outline-none">
                <option value="all">All Status</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Shortlisted">Shortlisted</option>
              </select>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-600 focus:outline-none">
                <option value="all">All Departments</option>
                {depts.map(d => <option key={d}>{d}</option>)}
              </select>
              <span className="text-sm text-stone-400 flex items-center">{filtered.length} results</span>
            </div>

            {/* Table */}
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
                        <td className="px-4 py-3">
                          <div className="font-medium text-stone-800">{c.name}</div>
                          {c.email && <div className="text-xs text-stone-400 truncate max-w-32">{c.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{c.position}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.department}</td>
                        <td className="px-4 py-3 text-stone-500">{c.education || '—'}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.totalExperience || '—'}</td>
                        <td className="px-4 py-3 text-stone-500">{c.source || '—'}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.interviewDate ? c.interviewDate.substring(0, 10) : '—'}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{c.hrInterview || '—'}</td>
                        <td className="px-4 py-3 text-stone-500">{c.technicalRound || '—'}</td>
                        <td className="px-4 py-3 text-stone-500">{c.finalRound || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.finalStatus] || 'bg-stone-100 text-stone-600'}`}>
                            {c.finalStatus || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                          {c.offeredCTC ? `₹${Number(c.offeredCTC).toLocaleString('en-IN')}` : '—'}
                        </td>
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

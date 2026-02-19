import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { confirmAction, alertError } from '../lib/alerts'
import StatusPill from '../components/StatusPill'
import { localInputToApiDateTime, toLocalInputValue, fmtDateTime } from '../lib/format'

type Job = {
  id: number
  title: string
  description?: string | null
  status: string
  created_at: string
  updated_at: string
}

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass'
const INPUT = 'rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/50'

export default function OfferedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [when, setWhen] = useState(toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)))

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return jobs
    return jobs.filter((j) => j.title.toLowerCase().includes(s) || (j.description || '').toLowerCase().includes(s))
  }, [jobs, search])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/jobs', { params: { status: 'OFFERED' } })
      setJobs(res.data?.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function claim(jobId: number) {
    const ok = await confirmAction({
      title: 'Claim this job?',
      text: 'This will assign the job to you at the selected date/time.',
      confirmText: 'Claim',
    })
    if (!ok) return

    try {
      await api.post(`/api/v1/jobs/${jobId}/claim`, {
        scheduled_at_local: localInputToApiDateTime(when),
      })
      toast.success('Job claimed ✅')
      await load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Claim failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Offered Jobs</h2>
          <p className="text-sm text-slate-600/80">Pick a job, choose a date, claim it.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input className={`w-full sm:w-72 ${INPUT}`} placeholder="Search jobs…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="datetime-local" className={`w-full sm:w-60 ${INPUT}`} value={when} onChange={(e) => setWhen(e.target.value)} />
          <button onClick={load} className="rounded-xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-3 py-2 text-sm transition shadow-glass">
            Refresh
          </button>
        </div>
      </div>

      <div className={CARD}>
        <div className="p-4 border-b border-slate-200/60 text-sm text-slate-600/80">
          Showing <span className="text-slate-900 font-medium">{filtered.length}</span> jobs • Selected schedule:{' '}
          <span className="text-slate-900 font-medium">{fmtDateTime(localInputToApiDateTime(when))}</span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-600/80">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-600/80">No offered jobs.</div>
        ) : (
          <ul className="divide-y divide-slate-200/60">
            {filtered.map((j) => (
              <li key={j.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/jobs/${j.id}`} className="font-semibold text-slate-900 hover:underline">
                      {j.title}
                    </Link>
                    <StatusPill status={j.status} />
                  </div>
                  {j.description && <div className="mt-1 text-sm text-slate-600/80">{j.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/jobs/${j.id}`} className="rounded-xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-3 py-2 text-sm transition shadow-glass">
                    Details
                  </Link>
                  <button onClick={() => claim(j.id)} className="rounded-xl bg-gradient-to-r from-emerald-500/80 to-sky-500/80 text-white px-3 py-2 text-sm transition hover:opacity-95 shadow-glass">
                    Claim
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

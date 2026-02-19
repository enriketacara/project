import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { alertError, confirmAction } from '../lib/alerts'
import StatusPill from '../components/StatusPill'
import { fmtDateTime, localInputToApiDateTime, toLocalInputValue } from '../lib/format'

type AnyObj = Record<string, any>
type AnyJob = Record<string, any>

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass'
const SUBCARD = 'rounded-2xl bg-white/70 border border-slate-200/60'
const INPUT = 'rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/50'

function pick<T = any>(obj: AnyObj, keys: string[], fallback: T | null = null): T | null {
  for (const k of keys) {
    const v = obj?.[k]
    if (v !== undefined && v !== null && v !== '') return v as T
  }
  return fallback
}

function normalizeJob(raw: AnyJob) {
  // Your backend returns schedule/completion/assessment under `assignment`
  const a = (raw?.assignment ?? {}) as AnyObj

  return {
    id: pick<number>(raw, ['id'])!,
    title: pick<string>(raw, ['title']) ?? '—',
    description: pick<string>(raw, ['description'], null),
    status: (pick<string>(raw, ['status'], 'OFFERED') ?? 'OFFERED').toString(),

    scheduledLocal: pick<string>(a, ['scheduled_at_local', 'scheduledAtLocal', 'scheduled_at', 'scheduledAt'], null),
    scheduledUtc: pick<string>(a, ['scheduled_at_utc', 'scheduledAtUtc', 'scheduled_utc', 'scheduledUtc'], null),
    completedLocal: pick<string>(a, ['completed_at_local', 'completedAtLocal', 'completed_at', 'completedAt'], null),
    completedUtc: pick<string>(a, ['completed_at_utc', 'completedAtUtc', 'completed_utc', 'completedUtc'], null),
    rating: pick<number>(a, ['assessment_rating', 'assessmentRating', 'rating'], null),
    notes: pick<string>(a, ['assessment_notes', 'assessmentNotes', 'notes'], null),
  }
}

function apiToInput(v?: string | null) {
  // accepts ISO or "YYYY-MM-DD HH:mm:ss"
  if (!v) return ''
  const s = v.replace(' ', 'T')
  return s.length >= 16 ? s.slice(0, 16) : s
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<ReturnType<typeof normalizeJob>[]>([])
  const [loading, setLoading] = useState(true)

  // per-job form state
  const [scheduleById, setScheduleById] = useState<Record<number, string>>({})
  const [ratingById, setRatingById] = useState<Record<number, number>>({})
  const [notesById, setNotesById] = useState<Record<number, string>>({})

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/my/jobs')
      const listRaw: AnyJob[] = res.data?.data ?? []
      const list = listRaw.map(normalizeJob)
      setJobs(list)

      setScheduleById((prev) => {
        const next = { ...prev }
        for (const j of list) {
          if (next[j.id] == null) next[j.id] = apiToInput(j.scheduledLocal) || toLocalInputValue(new Date())
        }
        return next
      })
      setRatingById((prev) => {
        const next = { ...prev }
        for (const j of list) {
          if (next[j.id] == null) next[j.id] = (j.rating ?? 5) as number
        }
        return next
      })
      setNotesById((prev) => {
        const next = { ...prev }
        for (const j of list) {
          if (next[j.id] == null) next[j.id] = j.notes ?? 'Work completed successfully.'
        }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function reschedule(jobId: number) {
    const when = scheduleById[jobId]
    if (!when) {
      toast.error('Select a schedule date/time first')
      return
    }

    const ok = await confirmAction({
      title: 'Update schedule?',
      text: 'This will update the scheduled date/time for this job.',
      confirmText: 'Update',
      icon: 'info',
    })
    if (!ok) return

    try {
      await api.patch(`/api/v1/jobs/${jobId}/schedule`, {
        scheduled_at_local: localInputToApiDateTime(when),
      })
      toast.success('Schedule updated ✅')
      await load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Reschedule failed')
    }
  }

  async function complete(jobId: number) {
    const rating = ratingById[jobId] ?? 5
    const notes = notesById[jobId] ?? ''

    const ok = await confirmAction({
      title: 'Complete job?',
      text: 'This will mark the job as completed and store your assessment.',
      confirmText: 'Complete',
      icon: 'warning',
    })
    if (!ok) return

    try {
      await api.post(`/api/v1/jobs/${jobId}/complete`, {
        assessment_rating: rating,
        assessment_notes: notes,
      })
      toast.success('Job completed ✅')
      await load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Complete failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Jobs</h2>
          <p className="text-sm text-slate-600/80">Reschedule or complete jobs you claimed.</p>
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-3 py-2 text-sm transition shadow-glass"
        >
          Refresh
        </button>
      </div>

      {!loading && jobs.length === 0 && (
        <div className={`${CARD} p-6 text-sm text-slate-600/80`}>
          No jobs yet. Go claim one from{' '}
          <Link className="underline" to="/offered">
            Offered Jobs
          </Link>
          .
        </div>
      )}

      {loading ? (
        <div className={`${CARD} p-6 text-sm text-slate-600/80`}>Loading…</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => {
            const schedule = scheduleById[j.id] ?? toLocalInputValue(new Date())
            const rating = ratingById[j.id] ?? 5
            const notes = notesById[j.id] ?? ''

            const isCompleted = (j.status || '').toUpperCase() === 'COMPLETED'

            return (
              <div key={j.id} className={`${CARD} p-6`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-slate-900">{j.title}</div>
                      <StatusPill status={j.status} />
                    </div>
                    {j.description && <div className="mt-1 text-sm text-slate-600/80">{j.description}</div>}
                  </div>
                  <Link
                    to={`/jobs/${j.id}`}
                    className="rounded-xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-3 py-2 text-sm transition shadow-glass w-fit"
                  >
                    Details
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`${SUBCARD} p-4`}>
                    <div className="text-xs text-slate-600/70">Scheduled (local)</div>
                    <div className="mt-1 text-sm text-slate-900">{fmtDateTime(j.scheduledLocal)}</div>
                    <div className="mt-3 text-xs text-slate-600/70">Scheduled (UTC)</div>
                    <div className="mt-1 text-sm text-slate-900">{fmtDateTime(j.scheduledUtc)}</div>
                  </div>
                  <div className={`${SUBCARD} p-4`}>
                    <div className="text-xs text-slate-600/70">Completed (local)</div>
                    <div className="mt-1 text-sm text-slate-900">{fmtDateTime(j.completedLocal)}</div>
                    <div className="mt-3 text-xs text-slate-600/70">Completed (UTC)</div>
                    <div className="mt-1 text-sm text-slate-900">{fmtDateTime(j.completedUtc)}</div>
                  </div>
                </div>

                {isCompleted ? (
                  <div className={`mt-4 ${SUBCARD} p-4`}>
                    <div className="text-xs text-slate-600/70">Assessment</div>
                    <div className="mt-2 text-sm text-slate-900">
                      Rating: <span className="font-medium">{j.rating ?? '-'}</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600/80">{j.notes ?? '-'}</div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className={`${SUBCARD} p-4`}>
                      <div className="text-sm font-medium text-slate-900">Reschedule</div>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="datetime-local"
                          className={`w-full sm:w-72 ${INPUT}`}
                          value={schedule}
                          onChange={(e) => setScheduleById((prev) => ({ ...prev, [j.id]: e.target.value }))}
                        />
                        <button
                          onClick={() => reschedule(j.id)}
                          className="rounded-xl bg-gradient-to-r from-indigo-500/80 to-sky-500/80 text-white px-3 py-2 text-sm transition hover:opacity-95 shadow-glass w-fit"
                        >
                          Update schedule
                        </button>
                      </div>
                    </div>

                    <div className={`${SUBCARD} p-4`}>
                      <div className="text-sm font-medium text-slate-900">Complete job</div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                          <label className="text-xs text-slate-600/70">Rating (1-5)</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            className={`mt-1 w-full ${INPUT}`}
                            value={rating}
                            onChange={(e) => setRatingById((prev) => ({ ...prev, [j.id]: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-600/70">Notes</label>
                          <input
                            className={`mt-1 w-full ${INPUT}`}
                            value={notes}
                            onChange={(e) => setNotesById((prev) => ({ ...prev, [j.id]: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          onClick={() => complete(j.id)}
                          className="rounded-xl bg-gradient-to-r from-emerald-500/80 to-fuchsia-500/80 text-white px-3 py-2 text-sm transition hover:opacity-95 shadow-glass"
                        >
                          Complete job
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

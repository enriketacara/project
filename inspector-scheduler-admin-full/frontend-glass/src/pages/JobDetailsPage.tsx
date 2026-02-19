import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import StatusPill from '../components/StatusPill'
import { fmtDateTime } from '../lib/format'

type AnyObj = Record<string, any>

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass'

function pick<T = any>(obj: AnyObj, keys: string[], fallback: T | null = null): T | null {
  for (const k of keys) {
    const v = obj?.[k]
    if (v !== undefined && v !== null && v !== '') return v as T
  }
  return fallback
}

function normalize(raw: AnyObj) {
  const a = (raw?.assignment ?? {}) as AnyObj
  return {
    id: pick<number>(raw, ['id'])!,
    title: pick<string>(raw, ['title']) ?? '—',
    description: pick<string>(raw, ['description'], null),
    status: (pick<string>(raw, ['status'], 'OFFERED') ?? 'OFFERED').toString(),

    createdAt: pick<string>(raw, ['created_at', 'createdAt'], null),
    updatedAt: pick<string>(raw, ['updated_at', 'updatedAt'], null),

    scheduledLocal: pick<string>(a, ['scheduled_at_local', 'scheduledAtLocal', 'scheduled_at', 'scheduledAt'], null),
    scheduledUtc: pick<string>(a, ['scheduled_at_utc', 'scheduledAtUtc', 'scheduled_utc', 'scheduledUtc'], null),
    completedLocal: pick<string>(a, ['completed_at_local', 'completedAtLocal', 'completed_at', 'completedAt'], null),
    completedUtc: pick<string>(a, ['completed_at_utc', 'completedAtUtc', 'completed_utc', 'completedUtc'], null),

    rating: pick<number>(a, ['assessment_rating', 'assessmentRating', 'rating'], null),
    notes: pick<string>(a, ['assessment_notes', 'assessmentNotes', 'notes'], null),
  }
}

export default function JobDetailsPage() {
  const { id } = useParams()
  const [job, setJob] = useState<ReturnType<typeof normalize> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await api.get(`/api/v1/jobs/${id}`)
        if (!mounted) return
        setJob(res.data?.data ? normalize(res.data.data) : null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Job Details</h2>
          <p className="text-sm text-slate-600/80">Full information for one job.</p>
        </div>
        <Link
          to="/offered"
          className="rounded-xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-3 py-2 text-sm transition shadow-glass"
        >
          Back
        </Link>
      </div>

      <div className={`${CARD} p-6`}>
        {loading ? (
          <div className="text-sm text-slate-600/80">Loading…</div>
        ) : !job ? (
          <div className="text-sm text-slate-600/80">Not found.</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-xl font-semibold text-slate-900">{job.title}</div>
              <StatusPill status={job.status} />
            </div>
            {job.description && <div className="text-sm text-slate-600/80">{job.description}</div>}

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="text-slate-600/70 text-xs">Created</div>
                <div className="mt-1 text-slate-900">{fmtDateTime(job.createdAt)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="text-slate-600/70 text-xs">Updated</div>
                <div className="mt-1 text-slate-900">{fmtDateTime(job.updatedAt)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="text-slate-600/70 text-xs">Scheduled Local</div>
                <div className="mt-1 text-slate-900">{fmtDateTime(job.scheduledLocal)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="text-slate-600/70 text-xs">Scheduled UTC</div>
                <div className="mt-1 text-slate-900">{fmtDateTime(job.scheduledUtc)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="text-slate-600/70 text-xs">Completed Local</div>
                <div className="mt-1 text-slate-900">{fmtDateTime(job.completedLocal)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="text-slate-600/70 text-xs">Completed UTC</div>
                <div className="mt-1 text-slate-900">{fmtDateTime(job.completedUtc)}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
              <div className="text-slate-600/70 text-xs">Assessment</div>
              <div className="mt-2 text-sm text-slate-900">
                Rating: <span className="font-medium">{job.rating ?? '-'}</span>
              </div>
              <div className="mt-1 text-sm text-slate-600/80">{job.notes ?? '-'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

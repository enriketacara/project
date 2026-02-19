import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../lib/api'
import { alertError } from '../../lib/alerts'

type Job = {
  id: number
  title: string
  description?: string
  status: string
  assignment?: {
    scheduled_at_local?: string | null
    completed_at_local?: string | null
    assessment_rating?: number | null
  } | null
  created_at: string
  updated_at: string
}

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass'
const BTN = 'rounded-2xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-4 py-2 text-sm shadow-glass'

export default function AdminInspectorJobsPage() {
  const { id } = useParams()
  const [items, setItems] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await api.get(`/api/v1/admin/inspectors/${id}/jobs`, { params: { per_page: 50 } })
        const arr = res.data?.data ?? []
        if (!mounted) return
        setItems(arr)
      } catch (e: any) {
        await alertError(e?.response?.data?.message ?? 'Failed to load inspector jobs')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inspector Jobs</h1>
          <p className="text-sm text-slate-600/80">History for inspector #{id}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/inspectors" className={BTN}>Back</Link>
          <Link to="/admin/jobs" className={BTN}>All Jobs</Link>
        </div>
      </div>

      <div className={`${CARD} mt-4 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/50">
              <tr className="text-left text-slate-700">
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>No jobs.</td></tr>
              ) : (
                items.map(j => (
                  <tr key={j.id} className="border-t border-slate-200/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{j.title}</div>
                      <div className="text-xs text-slate-600/80">#{j.id}</div>
                    </td>
                    <td className="px-4 py-3">{j.status}</td>
                    <td className="px-4 py-3">{j.assignment?.scheduled_at_local ?? '—'}</td>
                    <td className="px-4 py-3">{j.assignment?.completed_at_local ?? '—'}</td>
                    <td className="px-4 py-3">{j.assignment?.assessment_rating ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

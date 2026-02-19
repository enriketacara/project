import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { alertError } from '../../lib/alerts'

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass p-5'

type Dashboard = {
  jobs: { offered: number; claimed: number; completed: number }
  inspectors: { total: number; by_location: Record<string, number> }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get('/api/v1/admin/dashboard')
        if (!mounted) return
        setData(res.data?.data ?? null)
      } catch (e: any) {
        await alertError(e?.response?.data?.message ?? 'Failed to load dashboard')
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600/80">Overview of inspectors and job pipeline.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/inspectors" className="rounded-2xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-4 py-2 text-sm shadow-glass">
            Inspectors
          </Link>
          <Link to="/admin/jobs" className="rounded-2xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-4 py-2 text-sm shadow-glass">
            Jobs
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={CARD}>
          <div className="text-sm text-slate-600">Offered</div>
          <div className="text-3xl font-semibold text-slate-900">{data?.jobs?.offered ?? '—'}</div>
        </div>
        <div className={CARD}>
          <div className="text-sm text-slate-600">Claimed</div>
          <div className="text-3xl font-semibold text-slate-900">{data?.jobs?.claimed ?? '—'}</div>
        </div>
        <div className={CARD}>
          <div className="text-sm text-slate-600">Completed</div>
          <div className="text-3xl font-semibold text-slate-900">{data?.jobs?.completed ?? '—'}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={CARD}>
          <div className="text-sm font-semibold text-slate-900">Inspectors</div>
          <div className="mt-2 text-sm text-slate-700">Total: <span className="font-semibold">{data?.inspectors?.total ?? '—'}</span></div>
          <div className="mt-3 flex flex-wrap gap-2">
            {data?.inspectors?.by_location
              ? Object.entries(data.inspectors.by_location).map(([k,v]) => (
                <span key={k} className="rounded-full bg-white/70 border border-slate-200/70 px-3 py-1 text-xs text-slate-700">
                  {k}: <span className="font-semibold">{v}</span>
                </span>
              ))
              : <span className="text-sm text-slate-500">—</span>}
          </div>
        </div>

        <div className={CARD}>
          <div className="text-sm font-semibold text-slate-900">Quick actions</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link to="/admin/inspectors" className="rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-sky-500/20 border border-slate-200/70 px-4 py-3 text-sm shadow-glass hover:opacity-95">
              Manage Inspectors
            </Link>
            <Link to="/admin/jobs" className="rounded-2xl bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-pink-500/20 border border-slate-200/70 px-4 py-3 text-sm shadow-glass hover:opacity-95">
              Manage Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

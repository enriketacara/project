import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../../lib/api'
import { alertError, confirmAction } from '../../lib/alerts'

type Inspector = {
  id: number
  name: string
  email: string
  active: boolean
  location: 'UK' | 'MEXICO' | 'INDIA'
  timezone: string
  stats?: { claimed_total: number; completed_total: number; active_total: number; avg_rating: number | null }
}

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass'
const BTN = 'rounded-2xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-4 py-2 text-sm shadow-glass'
const INPUT = 'w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40'

async function upsertInspector(mode: 'create' | 'edit', initial?: Partial<Inspector>) {
  const isEdit = mode === 'edit'
  const { value, isConfirmed } = await Swal.fire({
    title: isEdit ? 'Edit inspector' : 'Create inspector',
    html: `
      <div style="text-align:left; display:grid; gap:10px;">
        <label>Name</label>
        <input id="sw_name" class="swal2-input" style="margin:0;" value="${initial?.name ?? ''}" />
        <label>Email</label>
        <input id="sw_email" class="swal2-input" style="margin:0;" value="${initial?.email ?? ''}" />
        <label>${isEdit ? 'Password (optional)' : 'Password'}</label>
        <input id="sw_password" type="password" class="swal2-input" style="margin:0;" value="" />
        <label>Location</label>
        <select id="sw_location" class="swal2-select" style="margin:0;">
          ${['UK','MEXICO','INDIA'].map(x => `<option value="${x}" ${initial?.location===x?'selected':''}>${x}</option>`).join('')}
        </select>
        <label>Timezone</label>
        <input id="sw_timezone" class="swal2-input" style="margin:0;" value="${initial?.timezone ?? ''}" placeholder="Europe/London" />
        <label style="display:flex; gap:8px; align-items:center;">
          <input id="sw_active" type="checkbox" ${initial?.active===false?'':'checked'} />
          Active
        </label>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? 'Save' : 'Create',
    preConfirm: () => {
      const name = (document.getElementById('sw_name') as HTMLInputElement).value.trim()
      const email = (document.getElementById('sw_email') as HTMLInputElement).value.trim()
      const password = (document.getElementById('sw_password') as HTMLInputElement).value
      const location = (document.getElementById('sw_location') as HTMLSelectElement).value
      const timezone = (document.getElementById('sw_timezone') as HTMLInputElement).value.trim()
      const active = (document.getElementById('sw_active') as HTMLInputElement).checked

      if (!name) return Swal.showValidationMessage('Name is required')
      if (!email) return Swal.showValidationMessage('Email is required')
      if (!isEdit && !password) return Swal.showValidationMessage('Password is required')
      return { name, email, password: password || undefined, location, timezone, active }
    },
  })

  if (!isConfirmed) return null
  return value as any
}

export default function AdminInspectorsPage() {
  const [items, setItems] = useState<Inspector[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [location, setLocation] = useState<string>('')
  const [active, setActive] = useState<string>('')

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/admin/inspectors', {
        params: {
          q: q || undefined,
          location: location || undefined,
          active: active === '' ? undefined : active === 'true',
          per_page: 50,
        },
      })
      // backend returns data as resource collection or array - normalize
      const arr = (res.data?.data?.data ?? res.data?.data ?? []).map((x: any) => x?.resource ?? x)
      setItems(arr)
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Failed to load inspectors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onCreate() {
    const payload = await upsertInspector('create', { timezone: 'Europe/London', location: 'UK', active: true } as any)
    if (!payload) return
    try {
      await api.post('/api/v1/admin/inspectors', payload)
      await Swal.fire({ title: 'Created', icon: 'success', timer: 1200, showConfirmButton: false })
      load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Create failed')
    }
  }

  async function onEdit(it: Inspector) {
    const payload = await upsertInspector('edit', it)
    if (!payload) return
    try {
      await api.patch(`/api/v1/admin/inspectors/${it.id}`, payload)
      await Swal.fire({ title: 'Saved', icon: 'success', timer: 1200, showConfirmButton: false })
      load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Update failed')
    }
  }

  async function onDeactivate(it: Inspector) {
    const ok = await confirmAction({
      title: 'Deactivate inspector?',
      text: `${it.name} will not be able to login.`,
      confirmText: 'Deactivate',
      icon: 'warning',
    })
    if (!ok) return
    try {
      await api.delete(`/api/v1/admin/inspectors/${it.id}`)
      await Swal.fire({ title: 'Deactivated', icon: 'success', timer: 1200, showConfirmButton: false })
      load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Deactivate failed')
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inspectors</h1>
          <p className="text-sm text-slate-600/80">CRUD + job stats. Soft deactivate supported.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin" className={BTN}>Dashboard</Link>
          <Link to="/admin/jobs" className={BTN}>Jobs</Link>
          <button onClick={onCreate} className="rounded-2xl bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-sky-500/25 border border-slate-200/70 px-4 py-2 text-sm shadow-glass hover:opacity-95">
            + Create
          </button>
        </div>
      </div>

      <div className={`${CARD} mt-4 p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className={INPUT} placeholder="Search name/email…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className={INPUT} value={location} onChange={(e)=>setLocation(e.target.value)}>
            <option value="">All locations</option>
            <option value="UK">UK</option>
            <option value="MEXICO">MEXICO</option>
            <option value="INDIA">INDIA</option>
          </select>
          <select className={INPUT} value={active} onChange={(e)=>setActive(e.target.value)}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button onClick={load} className={BTN}>Filter</button>
        </div>
      </div>

      <div className={`${CARD} mt-4 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/50">
              <tr className="text-left text-slate-700">
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stats</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>No inspectors.</td></tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="border-t border-slate-200/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{it.name}</div>
                      <div className="text-xs text-slate-600/80">{it.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{it.location}</div>
                      <div className="text-xs text-slate-600/80">{it.timezone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs border ${it.active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                        {it.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/70 border border-slate-200/70 px-3 py-1 text-xs">
                          Claimed: <b>{it.stats?.claimed_total ?? 0}</b>
                        </span>
                        <span className="rounded-full bg-white/70 border border-slate-200/70 px-3 py-1 text-xs">
                          Completed: <b>{it.stats?.completed_total ?? 0}</b>
                        </span>
                        <span className="rounded-full bg-white/70 border border-slate-200/70 px-3 py-1 text-xs">
                          Avg rating: <b>{it.stats?.avg_rating ?? '—'}</b>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/inspectors/${it.id}/jobs`} className={BTN}>Jobs</Link>
                        <button onClick={() => onEdit(it)} className={BTN}>Edit</button>
                        <button onClick={() => onDeactivate(it)} className="rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 text-sm shadow-glass text-rose-700">
                          Deactivate
                        </button>
                      </div>
                    </td>
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

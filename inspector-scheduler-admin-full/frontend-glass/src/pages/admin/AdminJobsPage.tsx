import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../../lib/api'
import { alertError, confirmAction } from '../../lib/alerts'

type Job = {
  id: number
  title: string
  description?: string
  status: 'OFFERED' | 'CLAIMED' | 'COMPLETED' | 'ARCHIVED'
  assignment?: {
    inspector?: { id: number; name: string; email: string }
    scheduled_at_local?: string | null
    completed_at_local?: string | null
  } | null
  archived_at?: string | null
  created_at: string
  updated_at: string
}

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass'
const BTN = 'rounded-2xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-4 py-2 text-sm shadow-glass'
const INPUT = 'w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40'

async function upsertJob(mode: 'create' | 'edit', initial?: Partial<Job>) {
  const isEdit = mode === 'edit'
  const { value, isConfirmed } = await Swal.fire({
    title: isEdit ? 'Edit job' : 'Create job',
    html: `
      <div style="text-align:left; display:grid; gap:10px;">
        <label>Title</label>
        <input id="sw_title" class="swal2-input" style="margin:0;" value="${initial?.title ?? ''}" />
        <label>Description</label>
        <textarea id="sw_desc" class="swal2-textarea" style="margin:0; height:110px;">${initial?.description ?? ''}</textarea>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? 'Save' : 'Create',
    preConfirm: () => {
      const title = (document.getElementById('sw_title') as HTMLInputElement).value.trim()
      const description = (document.getElementById('sw_desc') as HTMLTextAreaElement).value.trim()
      if (!title) return Swal.showValidationMessage('Title is required')
      return { title, description: description || null }
    },
  })

  if (!isConfirmed) return null
  return value as any
}

export default function AdminJobsPage() {
  const [items, setItems] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>('')

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/admin/jobs', {
        params: { status: status || undefined,
           per_page: 50 },
      })
      const arr = res.data?.data ?? []
      setItems(arr)
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onCreate() {
    const payload = await upsertJob('create')
    if (!payload) return
    try {
      await api.post('/api/v1/admin/jobs', payload)
      await Swal.fire({ title: 'Created', icon: 'success', timer: 1200, showConfirmButton: false })
      load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Create failed')
    }
  }

  async function onEdit(it: Job) {
    if (it.status === 'ARCHIVED') return alertError('Archived jobs cannot be edited.')
    const payload = await upsertJob('edit', it)
    if (!payload) return
    try {
      await api.patch(`/api/v1/admin/jobs/${it.id}`, payload)
      await Swal.fire({ title: 'Saved', icon: 'success', timer: 1200, showConfirmButton: false })
      load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Update failed')
    }
  }

  async function onArchive(it: Job) {
    const ok = await confirmAction({
      title: 'Archive job?',
      text: `Job #${it.id} will be hidden from Offered list.`,
      confirmText: 'Archive',
      icon: 'warning',
    })
    if (!ok) return
    try {
      await api.delete(`/api/v1/admin/jobs/${it.id}`)
      await Swal.fire({ title: 'Archived', icon: 'success', timer: 1200, showConfirmButton: false })
      load()
    } catch (e: any) {
      await alertError(e?.response?.data?.message ?? 'Archive failed')
    }
  }

  function pill(status: string) {
    if (status === 'OFFERED') return 'bg-sky-50 border-sky-200 text-sky-700'
    if (status === 'CLAIMED') return 'bg-amber-50 border-amber-200 text-amber-700'
    if (status === 'COMPLETED') return 'bg-emerald-50 border-emerald-200 text-emerald-700'
    return 'bg-slate-100 border-slate-200 text-slate-700'
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Jobs</h1>
          <p className="text-sm text-slate-600/80">CRUD + soft delete (archive). Admin does NOT assign jobs.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin" className={BTN}>Dashboard</Link>
          <Link to="/admin/inspectors" className={BTN}>Inspectors</Link>
          <button onClick={onCreate} className="rounded-2xl bg-gradient-to-r from-sky-500/25 via-purple-500/25 to-pink-500/25 border border-slate-200/70 px-4 py-2 text-sm shadow-glass hover:opacity-95">
            + Create
          </button>
        </div>
      </div>

      <div className={`${CARD} mt-4 p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select className={INPUT} value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="OFFERED">OFFERED</option>
            <option value="CLAIMED">CLAIMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <button onClick={load} className={BTN}>Filter</button>
        </div>
      </div>

      <div className={`${CARD} mt-4 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/50">
              <tr className="text-left text-slate-700">
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>No jobs.</td></tr>
              ) : (
                items.map((j) => (
                  <tr key={j.id} className="border-t border-slate-200/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{j.title}</div>
                      <div className="text-xs text-slate-600/80">#{j.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs border ${pill(j.status)}`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {j.assignment?.inspector ? (
                        <div>
                          <div className="text-slate-900">{j.assignment.inspector.name}</div>
                          <div className="text-xs text-slate-600/80">{j.assignment.inspector.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{j.assignment?.scheduled_at_local ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(j)} className={BTN} disabled={j.status==='ARCHIVED'}>
                          Edit
                        </button>
                        <button onClick={() => onArchive(j)} className="rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 text-sm shadow-glass text-rose-700" disabled={j.status==='ARCHIVED'}>
                          Archive
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

import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { clearToken, clearUser, getRole, isAuthed } from '../lib/auth'
import { confirmAction } from '../lib/alerts'

type Me = {
  id: number
  name: string
  email: string
  location: 'UK' | 'Mexico' | 'India'
  timezone: string
}

function NavLink({ to, label }: { to: string; label: string }) {
  const loc = useLocation()
  const active = loc.pathname === to
  return (
    <Link
      to={to}
      className={`rounded-xl px-3 py-2 text-sm transition ${active ? 'bg-white/70 border border-slate-200/70' : 'hover:bg-white/70'}`}
    >
      {label}
    </Link>
  )
}

export default function TopBar() {
  const nav = useNavigate()
  const [me, setMe] = useState<Me | null>(null)
  const authed = isAuthed()

  useEffect(() => {
    let mounted = true
    async function loadMe() {
      if (!authed) {
        setMe(null)
        return
      }
      try {
        const res = await api.get('/api/v1/me')
        if (!mounted) return
        setMe(res.data?.data ?? null)
      } catch {
        setMe(null)
      }
    }
    loadMe()
    return () => {
      mounted = false
    }
  }, [authed])

  async function logout() {
    const ok = await confirmAction({
      title: 'Logout?',
      text: 'Your token will be removed from this browser.',
      confirmText: 'Logout',
      icon: 'warning',
    })
    if (!ok) return

    try { await api.post('/api/v1/auth/logout', {}) } catch {}
    clearToken()
    clearUser()
    nav('/login')
  }

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-white/70 border border-slate-200/70 grid place-items-center shadow-glass">
            <span className="text-sm font-semibold text-slate-900">IS</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Inspector Scheduler</div>
            <div className="text-xs text-slate-600/80">Glass UI • pastel</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink to="/offered" label="Offered Jobs" />
          <NavLink to="/my-jobs" label="My Jobs" />
          {getRole() === 'ADMIN' && <NavLink to="/admin" label="Admin" />}
        </div>

        <div className="flex items-center gap-3">
          {me ? (
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-slate-900">{me.name}</div>
              <div className="text-xs text-slate-600/80">
                {me.location} • {me.timezone}
              </div>
            </div>
          ) : (
            <div className="hidden sm:block text-xs text-slate-600/80">
              {authed ? 'Loading…' : 'Not logged in'}
            </div>
          )}

          {authed ? (
            <button
              onClick={logout}
              className="rounded-xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-3 py-2 text-sm transition shadow-glass"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-white/70 hover:bg-white/85 border border-slate-200/70 px-3 py-2 text-sm transition shadow-glass"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

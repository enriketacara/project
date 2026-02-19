import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { setToken, setUser } from '../lib/auth'

const CARD = 'rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-glass'
const INPUT = 'rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/50'

export default function LoginPage() {
  const [email, setEmail] = useState('uk.inspector@company.test')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/login', { email, password })
      const token = res.data?.data?.token
      if (!token) throw new Error('Token missing')
      setToken(token)
      const user = res.data?.data?.user ?? res.data?.data?.inspector
      if (user) setUser(user)
      toast.success('Signed in ✅')
      const role = user?.role
      navigate(role === 'ADMIN' ? '/admin' : '/offered')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed')
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className={`${CARD} p-6`}>
        <h1 className="text-xl font-semibold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-600/80">Use seeded users for demo.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input autoComplete="email" className={`mt-1 w-full ${INPUT}`} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-700">Password</label>
            <input autoComplete="current-password" type="password" className={`mt-1 w-full ${INPUT}`} value={password}  onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500/90 via-indigo-500/90 to-sky-500/90 text-white py-2 text-sm font-medium hover:opacity-95 transition disabled:opacity-60 shadow-glass"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="text-xs text-slate-600/80">
            Demo password: <span className="font-mono">Password123!</span>
          </div>
        </form>
      </div>
    </div>
  )
}

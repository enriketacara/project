const TOKEN_KEY = 'inspector_token'
const USER_KEY = 'inspector_user'

export type AuthUser = {
  id: number
  name: string
  email: string
  role?: 'ADMIN' | 'INSPECTOR'
  location?: string
  timezone?: string
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
export const isAuthed = () => !!getToken()

export const setUser = (u: AuthUser) => localStorage.setItem(USER_KEY, JSON.stringify(u))
export const getUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}
export const clearUser = () => localStorage.removeItem(USER_KEY)
export const getRole = (): 'ADMIN' | 'INSPECTOR' | null => (getUser()?.role ?? null) as any

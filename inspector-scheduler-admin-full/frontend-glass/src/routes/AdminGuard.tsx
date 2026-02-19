import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getRole, isAuthed } from '../lib/auth'

export default function AdminGuard() {
  const loc = useLocation()
  if (!isAuthed()) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (getRole() !== 'ADMIN') return <Navigate to="/offered" replace />
  return <Outlet />
}

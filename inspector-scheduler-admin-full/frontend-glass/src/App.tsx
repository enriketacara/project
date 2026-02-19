import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import GlassShell from './components/GlassShell'
import TopBar from './components/TopBar'
import Guard from './routes/Guard'
import AdminGuard from './routes/AdminGuard'
import LoginPage from './pages/LoginPage'
import OfferedJobsPage from './pages/OfferedJobsPage'
import MyJobsPage from './pages/MyJobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminInspectorsPage from './pages/admin/AdminInspectorsPage'
import AdminInspectorJobsPage from './pages/admin/AdminInspectorJobsPage'
import AdminJobsPage from './pages/admin/AdminJobsPage'

export default function App() {
  return (
    <GlassShell>
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <Routes>
          <Route path="/" element={<Navigate to="/offered" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Guard />}>
            <Route path="/offered" element={<OfferedJobsPage />} />
            <Route path="/my-jobs" element={<MyJobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
          </Route>
<Route element={<AdminGuard />}>
  <Route path="/admin" element={<AdminDashboardPage />} />
  <Route path="/admin/inspectors" element={<AdminInspectorsPage />} />
  <Route path="/admin/inspectors/:id/jobs" element={<AdminInspectorJobsPage />} />
  <Route path="/admin/jobs" element={<AdminJobsPage />} />
</Route>

          <Route path="*" element={<Navigate to="/offered" replace />} />
        </Routes>
      </div>
    </GlassShell>
  )
}

import React from 'react'

export default function GlassShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-100 via-indigo-100 to-sky-100" />
      <div className="fixed inset-0 -z-10 opacity-70 bg-[radial-gradient(circle_at_18%_20%,rgba(236,72,153,0.35),transparent_45%),radial-gradient(circle_at_82%_24%,rgba(99,102,241,0.30),transparent_45%),radial-gradient(circle_at_50%_86%,rgba(56,189,248,0.28),transparent_50%)]" />
      <div className="relative">{children}</div>
    </div>
  )
}

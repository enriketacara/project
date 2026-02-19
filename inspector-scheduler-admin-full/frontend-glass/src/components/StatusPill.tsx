import React from 'react'

export default function StatusPill({ status }: { status: string }) {
  const s = (status || '').toUpperCase()
  const cls =
    s === 'OFFERED'
      ? 'bg-sky-500/10 text-sky-700 border-sky-300/60'
      : s === 'CLAIMED'
      ? 'bg-amber-500/10 text-amber-700 border-amber-300/60'
      : s === 'COMPLETED'
      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300/60'
      : 'bg-slate-500/10 text-slate-700 border-slate-300/60'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {s}
    </span>
  )
}

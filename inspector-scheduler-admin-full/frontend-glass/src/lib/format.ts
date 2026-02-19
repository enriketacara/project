export function fmtDateTime(v?: string | null) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return d.toLocaleString()
}
export function toLocalInputValue(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
export function localInputToApiDateTime(v: string) {
  if (!v) return v
  const [d, t] = v.split('T')
  return `${d} ${t}:00`
}

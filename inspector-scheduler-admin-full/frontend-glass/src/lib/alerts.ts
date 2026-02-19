import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const glass = {
  background: 'rgba(255,255,255,0.90)',
  color: '#0f172a',
  backdrop: 'rgba(15, 23, 42, 0.18)',
}

export async function confirmAction(opts: {
  title: string
  text?: string
  confirmText?: string
  icon?: 'question' | 'warning' | 'info'
}) {
  const res = await MySwal.fire({
    title: opts.title,
    text: opts.text,
    icon: opts.icon ?? 'question',
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? 'Confirm',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#94a3b8',
    ...glass,
  })
  return res.isConfirmed
}

export async function alertError(message: string) {
  return MySwal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    confirmButtonColor: '#ec4899',
    ...glass,
  })
}

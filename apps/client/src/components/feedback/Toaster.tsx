import { createPortal } from 'react-dom'
import { useToastStore, ToastVariant } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const variantClass: Record<ToastVariant, string> = {
  success: 'border-primary-200 bg-primary-50 text-primary-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-gray-200 bg-white text-gray-800',
}

/** Renders the live toast stack. Mount once near the app root. */
export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={cn(
            'flex items-start justify-between gap-3 rounded-lg border p-4 text-sm shadow-card',
            variantClass[toast.variant],
          )}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}

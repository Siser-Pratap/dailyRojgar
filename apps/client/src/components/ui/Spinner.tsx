import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizeClass: Record<Size, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-4',
}

export function Spinner({ size = 'md', className }: { size?: Size; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-primary-600 border-t-transparent',
        sizeClass[size],
        className,
      )}
    />
  )
}

/** Full-viewport centered spinner — use for route/page suspense. */
export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

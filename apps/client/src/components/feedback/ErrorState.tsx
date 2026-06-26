import { Button } from '@/components/ui'

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="text-4xl">⚠️</div>
      <h3 className="mt-4 font-semibold text-red-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-red-700">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

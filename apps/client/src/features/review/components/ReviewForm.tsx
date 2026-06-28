import { useState } from 'react'
import { Button, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useCreateReview } from '../hooks'

export function ReviewForm({
  bookingId,
  workerId,
  onSubmitted,
}: {
  bookingId: string
  workerId?: string
  onSubmitted?: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const createReview = useCreateReview(workerId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) return
    createReview.mutate(
      { bookingId, rating, comment: comment.trim() || undefined },
      { onSuccess: () => onSubmitted?.() },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={cn(
              'text-2xl transition',
              (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300',
            )}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        label="Comment (optional)"
        placeholder="How was the work?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button type="submit" isLoading={createReview.isPending} disabled={rating < 1}>
        Submit review
      </Button>
    </form>
  )
}

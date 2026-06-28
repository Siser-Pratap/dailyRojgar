import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import { createReview, getReviewByBooking } from './api'

export function useBookingReview(bookingId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['review', 'booking', bookingId],
    queryFn: () => getReviewByBooking(bookingId as string),
    enabled: Boolean(bookingId) && enabled,
  })
}

export function useCreateReview(workerId?: string) {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: createReview,
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['review', 'booking', review.bookingId] })
      queryClient.invalidateQueries({ queryKey: ['booking', review.bookingId] })
      if (workerId) {
        queryClient.invalidateQueries({ queryKey: ['worker-reviews', workerId] })
        queryClient.invalidateQueries({ queryKey: ['worker-profile', workerId] })
      }
      queryClient.invalidateQueries({ queryKey: ['search-workers'] })
      toast.success('Thanks for your review')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not submit review')),
  })
}

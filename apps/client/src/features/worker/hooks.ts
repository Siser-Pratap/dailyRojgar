import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import {
  addWorkerDocument,
  getWorkerProfile,
  getWorkerReviews,
  getWorkerStats,
  updateAvailability,
  upsertWorkerProfile,
} from './api'

export function useWorkerProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['worker-profile', id],
    queryFn: () => getWorkerProfile(id as string),
    enabled: Boolean(id),
  })
}

export function useWorkerReviews(id: string | undefined) {
  return useQuery({
    queryKey: ['worker-reviews', id],
    queryFn: () => getWorkerReviews(id as string),
    enabled: Boolean(id),
  })
}

export function useWorkerStats() {
  return useQuery({
    queryKey: ['worker-stats'],
    queryFn: getWorkerStats,
  })
}

/** Invalidates the current worker's own profile + stats after a mutation. */
function useWorkerSelfInvalidation() {
  const queryClient = useQueryClient()
  return (workerUserId?: string) => {
    if (workerUserId) queryClient.invalidateQueries({ queryKey: ['worker-profile', workerUserId] })
    queryClient.invalidateQueries({ queryKey: ['worker-stats'] })
  }
}

export function useUpdateAvailability(workerUserId?: string) {
  const invalidate = useWorkerSelfInvalidation()
  const toast = useToast()
  return useMutation({
    mutationFn: updateAvailability,
    onSuccess: (profile) => {
      invalidate(workerUserId)
      toast.success(profile.isAvailable ? 'You are now available' : 'You are now unavailable')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not update availability')),
  })
}

export function useUpsertWorkerProfile(workerUserId?: string) {
  const invalidate = useWorkerSelfInvalidation()
  const toast = useToast()
  return useMutation({
    mutationFn: upsertWorkerProfile,
    onSuccess: () => {
      invalidate(workerUserId)
      toast.success('Profile saved')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not save profile')),
  })
}

export function useAddWorkerDocument(workerUserId?: string) {
  const invalidate = useWorkerSelfInvalidation()
  const toast = useToast()
  return useMutation({
    mutationFn: addWorkerDocument,
    onSuccess: () => {
      invalidate(workerUserId)
      toast.success('Document uploaded for review')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not upload document')),
  })
}

import { useQuery } from '@tanstack/react-query'
import { getWorkerProfile, getWorkerReviews } from './api'

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

import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import { fetchPriceRecommendation, fetchProfileSuggestions } from './api'

export function usePriceRecommendation() {
  const toast = useToast()
  return useMutation({
    mutationFn: fetchPriceRecommendation,
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not fetch price suggestion')),
  })
}

export function useProfileSuggestions() {
  const toast = useToast()
  return useMutation({
    mutationFn: fetchProfileSuggestions,
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not fetch suggestions')),
  })
}

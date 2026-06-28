import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchWorkers, type SearchWorkersParams } from './api'

/** Live worker search; keeps previous page visible while the next loads. */
export function useSearchWorkers(params: SearchWorkersParams) {
  return useQuery({
    queryKey: ['search-workers', params],
    queryFn: () => searchWorkers(params),
    placeholderData: keepPreviousData,
  })
}

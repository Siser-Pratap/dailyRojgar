import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Input, Select, SkeletonGrid } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { useDebounce } from '@/hooks/useDebounce'
import { WorkerCard } from '../components/WorkerCard'
import { useSearchWorkers } from '../hooks'
import type { WorkerSortBy } from '../api'

const SERVICE_CATEGORIES = [
  'Construction',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'House Help',
  'Painting',
  'Repairs',
  'Driving',
  'Gardening',
  'Sanitation',
]

const categoryOptions = [
  { label: 'All categories', value: '' },
  ...SERVICE_CATEGORIES.map((name) => ({ label: name, value: name })),
]

const ratingOptions = [
  { label: 'Any rating', value: '0' },
  { label: '4★ & above', value: '4' },
  { label: '3★ & above', value: '3' },
  { label: '2★ & above', value: '2' },
]

const sortOptions: { label: string; value: WorkerSortBy }[] = [
  { label: 'Top rated', value: 'rating' },
  { label: 'Price: low to high', value: 'price' },
  { label: 'Most reviewed', value: 'reviews' },
  { label: 'Smart match', value: 'smart' },
]

const PAGE_SIZE = 12

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [minRating, setMinRating] = useState('0')
  const [maxPrice, setMaxPrice] = useState('1500')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<WorkerSortBy>('rating')
  const [page, setPage] = useState(1)

  const debouncedQuery = useDebounce(query)

  const params = useMemo(
    () => ({
      q: debouncedQuery.trim() || undefined,
      categoryId: categoryId || undefined,
      minRating: Number(minRating) > 0 ? Number(minRating) : undefined,
      maxPrice: Number(maxPrice) < 1500 ? Number(maxPrice) : undefined,
      availability: availableOnly ? true : undefined,
      sortBy,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedQuery, categoryId, minRating, maxPrice, availableOnly, sortBy, page],
  )

  const { data, isLoading, isError, isFetching, refetch } = useSearchWorkers(params)

  // Any filter change should reset pagination to the first page.
  const onFilterChange =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      setPage(1)
    }

  const workers = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Find workers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Filter by skill, category, rating, price, and availability.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="card h-fit space-y-4 p-5">
          <h2 className="text-lg font-bold text-gray-950">Filters</h2>

          <Input
            label="Search"
            placeholder="Skill, name, or keyword"
            value={query}
            onChange={(e) => onFilterChange(setQuery)(e.target.value)}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => onFilterChange(setCategoryId)(e.target.value)}
          />
          <Select
            label="Minimum rating"
            options={ratingOptions}
            value={minRating}
            onChange={(e) => onFilterChange(setMinRating)(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-gray-700">
              Max price / day: ₹{maxPrice}
            </label>
            <input
              className="mt-2 w-full accent-primary-600"
              type="range"
              min={300}
              max={1500}
              step={50}
              value={maxPrice}
              onChange={(e) => onFilterChange(setMaxPrice)(e.target.value)}
            />
          </div>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700">
            <span>Available now only</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary-600"
              checked={availableOnly}
              onChange={(e) => onFilterChange(setAvailableOnly)(e.target.checked)}
            />
          </label>
          <Select
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => onFilterChange(setSortBy)(e.target.value as WorkerSortBy)}
          />
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {isLoading ? 'Searching…' : `${total} worker${total === 1 ? '' : 's'} found`}
            </p>
            {isFetching && !isLoading && <span className="text-xs text-gray-400">Updating…</span>}
          </div>

          {isLoading ? (
            <SkeletonGrid count={6} />
          ) : isError ? (
            <ErrorState
              title="Could not load workers"
              description="There was a problem fetching search results."
              onRetry={() => refetch()}
            />
          ) : workers.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No workers match your filters"
              description="Try widening your price range, lowering the rating, or clearing the category."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {workers.map((worker) => (
                <WorkerCard key={worker._id} worker={worker} />
              ))}
            </div>
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

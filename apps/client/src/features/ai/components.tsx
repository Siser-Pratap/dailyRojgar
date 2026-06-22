import { useQuery } from '@tanstack/react-query'
import { SectionCard, StatusBadge } from '@/features/phase8/components'
import { formatCurrency } from '@/lib/utils'
import { fetchPriceRecommendation, fetchProfileSuggestions, fetchSmartWorkerMatches } from './api'

export function SmartMatchingPanel() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['ai-smart-matches', 'Electrical'],
    queryFn: () => fetchSmartWorkerMatches({ categoryId: 'Electrical', lat: 28.6139, lng: 77.209 }),
  })

  const topMatches = data?.items.slice(0, 3) ?? []

  return (
    <SectionCard title="AI smart matching">
      {isLoading && <div className="h-16 animate-pulse rounded bg-gray-100" />}
      {isError && (
        <p className="rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          Smart matching API unavailable; showing rule-based algorithm details.
        </p>
      )}
      <div className="mt-3 grid gap-3">
        {topMatches.length === 0 ? (
          <div className="rounded-lg bg-primary-50 p-4 text-sm text-primary-800">
            Score = proximity 30% + quality 35% + experience 20% + availability 15%.
          </div>
        ) : (
          topMatches.map((match) => (
            <div key={match._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-950">{match.categoryId} worker</p>
                <StatusBadge status={`score ${Math.round(match.smartMatch.score * 100)}`} />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {match.smartMatch.explanation.join(' • ')}
              </p>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}

export function PriceRecommendationPanel() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['ai-price-recommendation', 'Electrical'],
    queryFn: () =>
      fetchPriceRecommendation({ categoryId: 'Electrical', pincode: '110001', estimatedHours: 8 }),
  })

  return (
    <SectionCard title="Dynamic price recommendation">
      {isLoading && <div className="h-16 animate-pulse rounded bg-gray-100" />}
      {isError && (
        <p className="rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          Login as worker/admin to fetch live AI pricing.
        </p>
      )}
      <div className="grid gap-3 text-sm">
        <div className="rounded-lg bg-primary-50 p-4">
          <p className="text-primary-800">Suggested range</p>
          <p className="text-2xl font-bold text-gray-950">
            {data
              ? `${formatCurrency(data.suggestedRange.min)} - ${formatCurrency(data.suggestedRange.max)}`
              : '₹765 - ₹980'}
          </p>
        </div>
        <p className="text-gray-600">
          Factors: location demand, day/time, available supply, and active booking demand.
        </p>
      </div>
    </SectionCard>
  )
}

export function ProfileAssistantPanel() {
  const { data, isError } = useQuery({
    queryKey: ['ai-profile-suggestions'],
    queryFn: () =>
      fetchProfileSuggestions({
        bio: 'Experienced electrician available for home and shop repairs.',
        skills: ['Wiring', 'Fan repair'],
        categoryId: 'Electrical',
        pricePerDay: 850,
      }),
  })

  const suggestions = data?.suggestions ?? [
    {
      type: 'profile_improvement',
      title: 'Add a stronger work summary',
      detail: 'Mention years of experience, locality, response time, and common jobs handled.',
    },
  ]

  return (
    <SectionCard title="AI profile assistant">
      {isError && (
        <p className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          Login as worker/admin to fetch live assistant suggestions.
        </p>
      )}
      <div className="grid gap-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.title} className="rounded-lg border border-gray-200 p-4">
            <span className="badge-green">{suggestion.type.replace('_', ' ')}</span>
            <p className="mt-2 font-semibold text-gray-950">{suggestion.title}</p>
            <p className="mt-1 text-sm text-gray-600">{suggestion.detail}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

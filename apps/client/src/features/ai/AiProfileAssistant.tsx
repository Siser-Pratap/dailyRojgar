import { Button, Card } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { usePriceRecommendation, useProfileSuggestions } from './hooks'

/**
 * AI helper for the worker profile editor: suggests a daily rate and profile
 * improvements (incl. a Claude-generated bio when configured). Degrades to the
 * rule-based engine server-side; on error the actions simply surface a toast.
 */
export function AiProfileAssistant({
  getValues,
  onApplyPrice,
  onApplyBio,
}: {
  getValues: () => {
    categoryId: string
    pricePerDay: number
    skills: string[]
    bio?: string
  }
  onApplyPrice: (price: number) => void
  onApplyBio: (bio: string) => void
}) {
  const price = usePriceRecommendation()
  const profile = useProfileSuggestions()

  const handlePrice = () => {
    const { categoryId } = getValues()
    if (!categoryId) return
    price.mutate({ categoryId })
  }

  const handleSuggest = () => {
    const v = getValues()
    if (!v.categoryId) return
    profile.mutate({
      categoryId: v.categoryId,
      pricePerDay: v.pricePerDay || 0,
      skills: v.skills,
      bio: v.bio ?? '',
    })
  }

  return (
    <Card className="h-fit p-6">
      <div className="flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h2 className="text-lg font-bold text-gray-950">AI assistant</h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Get a suggested rate and profile tips. Select a category first.
      </p>

      <div className="mt-4 grid gap-3">
        <Button variant="outline" size="sm" onClick={handlePrice} isLoading={price.isPending}>
          Suggest a price
        </Button>
        {price.data && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <p className="font-semibold text-gray-950">
              Suggested: {formatCurrency(price.data.suggestedPrice)}/day
            </p>
            <p className="text-gray-600">
              Range {formatCurrency(price.data.suggestedRange.min)}–
              {formatCurrency(price.data.suggestedRange.max)}
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => onApplyPrice(price.data!.suggestedPrice)}
            >
              Use {formatCurrency(price.data.suggestedPrice)}
            </Button>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={handleSuggest} isLoading={profile.isPending}>
          Improve my profile
        </Button>
        {profile.data && (
          <div className="grid gap-2 text-sm">
            {profile.data.suggestions.length === 0 ? (
              <p className="text-gray-600">Your profile looks good.</p>
            ) : (
              <ul className="grid gap-2">
                {profile.data.suggestions.map((s) => (
                  <li key={s.title} className="rounded-lg border border-gray-200 p-3">
                    <p className="font-medium text-gray-900">{s.title}</p>
                    <p className="text-gray-600">{s.detail}</p>
                  </li>
                ))}
              </ul>
            )}
            {profile.data.improvedBio && (
              <div className="rounded-lg border border-primary-200 bg-primary-50 p-3">
                <p className="font-medium text-primary-900">Suggested bio</p>
                <p className="mt-1 text-primary-800">{profile.data.improvedBio}</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => onApplyBio(profile.data!.improvedBio!)}
                >
                  Use this bio
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

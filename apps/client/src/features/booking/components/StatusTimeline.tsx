import { formatDate } from '@/lib/utils'
import type { BookingStatusEntry } from '../api'

/** Vertical timeline of a booking's status history (most recent last). */
export function StatusTimeline({ history }: { history: BookingStatusEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-gray-500">No status updates yet.</p>
  }

  return (
    <ol className="relative ml-2 border-l border-gray-200">
      {history.map((entry, index) => (
        <li key={`${entry.status}-${entry.at}-${index}`} className="mb-5 ml-4 last:mb-0">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary-500" />
          <p className="font-semibold capitalize text-gray-900">
            {entry.status.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(entry.at, {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {entry.reason && <p className="mt-0.5 text-sm text-gray-600">{entry.reason}</p>}
        </li>
      ))}
    </ol>
  )
}

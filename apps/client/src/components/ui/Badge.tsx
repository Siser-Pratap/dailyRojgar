import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'green' | 'gray' | 'yellow' | 'red'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variantClass: Record<Variant, string> = {
  green: 'badge-green',
  gray: 'badge-gray',
  yellow: 'badge-yellow',
  red: 'badge-red',
}

export function Badge({ variant = 'gray', className, ...props }: BadgeProps) {
  return <span className={cn(variantClass[variant], className)} {...props} />
}

/** Maps a domain status string to a coloured badge. */
export function StatusBadge({ status }: { status: string }) {
  const variant: Variant =
    status === 'completed' || status === 'captured' || status === 'paid' || status === 'accepted'
      ? 'green'
      : status === 'pending' || status === 'created' || status === 'in_progress'
        ? 'yellow'
        : status === 'cancelled' ||
            status === 'refunded' ||
            status === 'rejected' ||
            status === 'failed'
          ? 'red'
          : 'gray'

  return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>
}

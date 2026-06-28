import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizeClass: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string
  src?: string | null
  size?: Size
  className?: string
}) {
  const [errored, setErrored] = useState(false)
  const showImage = src && !errored

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-bold text-primary-800',
        sizeClass[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

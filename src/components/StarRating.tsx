import { cn } from '@/lib/utils'

interface Props {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function StarRating({ rating, max = 5, size = 'md', showLabel = false }: Props) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }

  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Betyg ${rating} av ${max}`}>
      <span className={cn('tracking-tight', sizes[size])}>
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={i < rating ? 'text-amber-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </span>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-700">{rating}/{max}</span>
      )}
    </span>
  )
}

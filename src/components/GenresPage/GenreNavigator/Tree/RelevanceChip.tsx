import clsx from 'clsx'
import { FC, useMemo } from 'react'

const RelevanceChip: FC<{ relevance: number; className?: string }> = ({
  relevance,
  className,
}) => {
  const [text, color, title] = useMemo(
    () =>
      relevance === 99
        ? ['?', 'bg-red-200 text-red-500', 'Missing Relevance']
        : [relevance, 'bg-gray-200 text-gray-500'],
    [relevance]
  )

  return (
    <span
      className={clsx(
        'text-xs font-bold px-1 py-0.5 rounded-full',
        color,
        className
      )}
      title={title}
    >
      {text}
    </span>
  )
}

export default RelevanceChip
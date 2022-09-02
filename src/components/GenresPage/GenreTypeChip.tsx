import clsx from 'clsx'
import { FC, useMemo } from 'react'

import { GenreType } from '../../server/db/genre/outputs'
import { capitalize } from '../../utils/string'

const GenreTypeChip: FC<{ type: GenreType; className?: string }> = ({
  type,
  className,
}) => {
  const title = useMemo(() => capitalize(type), [type])

  const text = useMemo(
    () => (type === GenreType.MOVEMENT ? 'Mvmt' : capitalize(type)),
    [type]
  )

  return (
    <span
      className={clsx(
        'rounded-full bg-gray-200 px-1 py-0.5 text-xs font-bold text-gray-500',
        className
      )}
      title={title}
    >
      {text}
    </span>
  )
}

export default GenreTypeChip

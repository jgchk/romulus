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
        'text-xs font-bold px-1 py-0.5 rounded-full bg-gray-200 text-gray-500',
        className
      )}
      title={title}
    >
      {text}
    </span>
  )
}

export default GenreTypeChip

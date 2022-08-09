import { FC, useMemo } from 'react'

import { GenreType } from '../../server/db/genre'
import { capitalize } from '../../utils/string'

const GenreTypeChip: FC<{ type: GenreType }> = ({ type }) => {
  const title = useMemo(() => capitalize(type), [type])

  const text = useMemo(
    () => (type === GenreType.MOVEMENT ? 'Mvmt' : capitalize(type)),
    [type]
  )

  return (
    <span
      className='text-xs font-bold px-1 py-0.5 rounded-full bg-gray-200 text-gray-500'
      title={title}
    >
      {text}
    </span>
  )
}

export default GenreTypeChip

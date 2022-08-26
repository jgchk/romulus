import { FC, useMemo } from 'react'

import { useSimpleGenreQuery } from '../../../services/genres'
import GenreLink from '../GenreLink'

const RomcodeGenreLink: FC<{ id: number }> = ({ id }) => {
  const { data, error } = useSimpleGenreQuery(id)

  const text = useMemo(() => {
    if (data) {
      return data.name
    }

    if (error) {
      return 'Error'
    }

    return 'Loading'
  }, [data, error])

  return (
    <GenreLink id={id}>
      <a>{text}</a>
    </GenreLink>
  )
}

export default RomcodeGenreLink

import Link from 'next/link'
import { FC, useMemo } from 'react'

import { useSimpleGenreQuery } from '../../../services/genres'

const GenreLink: FC<{ id: number }> = ({ id }) => {
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
    <Link href={{ pathname: '/genres', query: { id: id.toString() } }}>
      <a>{text}</a>
    </Link>
  )
}

export default GenreLink

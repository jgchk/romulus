import type { NextPage } from 'next'
import GenreCanvas from '../../components/GenreCanvas'
import { useGenresQuery } from '../../services/genres'

const Canvas: NextPage = () => {
  const genresQuery = useGenresQuery()

  if (genresQuery.data) {
    return <GenreCanvas genres={genresQuery.data} />
  }

  if (genresQuery.error) {
    return <div>Error while fetching genres :(</div>
  }

  return <div>Loading...</div>
}

export default Canvas

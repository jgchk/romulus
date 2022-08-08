import type { NextPage } from 'next'
import { FC, useState } from 'react'

import { CenteredLoader } from '../../components/common/Loader'
import GenreCanvas from '../../components/GenreCanvas'
import { DefaultGenre } from '../../server/db/genre'
import { useGenresQuery } from '../../services/genres'

const Canvas: FC<{ genres: DefaultGenre[] }> = ({ genres }) => {
  const [data, setData] = useState(genres)

  return <GenreCanvas genres={data} onChange={(g) => setData(g)} />
}

const Wrapper: NextPage = () => {
  const genresQuery = useGenresQuery()

  if (genresQuery.data) {
    return <Canvas genres={genresQuery.data} />
  }

  if (genresQuery.error) {
    return <div>Error while fetching genres :(</div>
  }

  return <CenteredLoader />
}

export default Wrapper

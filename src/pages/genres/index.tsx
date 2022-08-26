import type { NextPage } from 'next'

import GenrePage from '../../components/GenrePage'
import { GenrePageProvider } from '../../components/GenrePage/context'
import { useIntRouteParam } from '../../utils/routes'

const Genres: NextPage = () => {
  const id = useIntRouteParam('id')

  return (
    <GenrePageProvider id={id}>
      <GenrePage />
    </GenrePageProvider>
  )
}

export default Genres

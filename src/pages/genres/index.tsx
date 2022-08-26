import { FC } from 'react'

import GenrePage from '../../components/GenrePage'
import { GenrePageProvider } from '../../components/GenrePage/context'
import { isGenreFormField } from '../../components/GenrePage/GenreForm'
import {
  useCustomRouteParam,
  useIntRouteParam,
  useStringRouteParam,
} from '../../utils/routes'

const Genres: FC = () => {
  const id = useIntRouteParam('id')
  const view = useStringRouteParam('view')
  const autoFocus = useCustomRouteParam('focus', isGenreFormField)

  return (
    <GenrePageProvider id={id} view={view} autoFocus={autoFocus}>
      <GenrePage />
    </GenrePageProvider>
  )
}

export default Genres

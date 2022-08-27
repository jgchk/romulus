import { FC, useMemo } from 'react'

import GenrePage, { GenrePageView } from '../../components/GenrePage'
import { GenrePageProvider } from '../../components/GenrePage/context'
import { isGenreFormField } from '../../components/GenrePage/GenreForm'
import {
  useCustomRouteParam,
  useIntRouteParam,
  useStringRouteParam,
} from '../../utils/routes'

const Genres: FC = () => {
  const id = useIntRouteParam('id')
  const viewType = useStringRouteParam('view')
  const autoFocus = useCustomRouteParam('focus', isGenreFormField)

  const view: GenrePageView = useMemo(() => {
    if (viewType === 'edit' && id !== undefined) {
      return { type: 'edit', id, autoFocus }
    } else if (viewType === 'history' && id !== undefined) {
      return { type: 'history', id }
    } else if (viewType === 'create') {
      return { type: 'create' }
    } else if (id !== undefined) {
      return { type: 'view', id }
    } else {
      return { type: 'default' }
    }
  }, [autoFocus, id, viewType])

  return (
    <GenrePageProvider id={id}>
      <GenrePage view={view} />
    </GenrePageProvider>
  )
}

export default Genres

import { FC, useEffect, useMemo } from 'react'

import GenrePage, { GenrePageView } from '../../components/GenresPage'
import {
  usePathUpdater,
  useTreeState,
} from '../../components/GenresPage/GenreNavigator/Tree/state'
import { isGenreFormField } from '../../components/GenresPage/GenreView/Form'
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

  const setSelectedPath = useTreeState((state) => state.setSelectedPath)
  const newPath = usePathUpdater(id)

  useEffect(() => {
    if (newPath) {
      setSelectedPath(newPath.path)
    }
  }, [newPath, setSelectedPath])

  return <GenrePage view={view} />
}

export default Genres

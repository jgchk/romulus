'use client'

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
import { FC, useEffect, useMemo } from 'react'

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
    } else if (id === undefined) {
      return { type: 'default' }
    } else {
      return { type: 'view', id }
    }
  }, [autoFocus, id, viewType])

  const setSelectedId = useTreeState((state) => state.setSelectedId)
  useEffect(() => setSelectedId(id), [id, setSelectedId])

  const newPath = usePathUpdater()
  const setSelectedPath = useTreeState((state) => state.setSelectedPath)
  useEffect(() => {
    if (newPath) {
      setSelectedPath(newPath.path)
    }
  }, [newPath, setSelectedPath])

  return <GenrePage view={view} />
}

export default Genres

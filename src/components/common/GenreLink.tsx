import Link, { LinkProps } from 'next/link'
import { Query } from 'nextjs-routes'
import { FC, ReactNode, useMemo } from 'react'

import {
  useSimpleGenreQuery,
  useTreeGenresMapQuery,
} from '../../services/genres'
import { GenrePageView } from '../GenresPage'
import { useGenreTreeState } from '../GenresPage/GenreNavigator/Tree/useGenreTreeState'
import { GenreFormFields } from '../GenresPage/GenreView/Form'

export const useGenreLinkHref = (
  id: number,
  view?: GenrePageView['type'],
  autoFocus?: keyof GenreFormFields
) => {
  const href: { pathname: '/genres'; query: Query } = useMemo(
    () => ({
      pathname: '/genres',
      query: {
        id: id.toString(),
        ...(view ? { view } : {}),
        ...(autoFocus ? { focus: autoFocus } : {}),
      },
    }),
    [autoFocus, id, view]
  )

  return href
}

export const useGenreLinkPath = (id: number) => {
  const { selectedPath } = useGenreTreeState()
  const genresMapQuery = useTreeGenresMapQuery()

  const path = useMemo(() => {
    if (!selectedPath) return

    const idIndex = selectedPath.lastIndexOf(id)
    if (idIndex !== -1) {
      return [...selectedPath.slice(0, idIndex), id]
    }

    const genresMap = genresMapQuery.data
    if (!genresMap) return

    const queue = [...selectedPath]
    let currId = queue.pop()
    while (currId !== undefined) {
      const genre = genresMap.get(currId)
      if (!genre) continue

      if (genre.childGenres.some((g) => g.id === id)) {
        return [...queue, currId, id]
      }

      currId = queue.pop()
    }
  }, [genresMapQuery.data, id, selectedPath])

  return path
}

const GenreLink: FC<
  Omit<LinkProps, 'href'> & {
    id: number
    view?: GenrePageView['type']
    autoFocus?: keyof GenreFormFields
    className?: string
    children?: ReactNode
  }
> = ({ id, view, autoFocus, children, className, ...props }) => {
  const href = useGenreLinkHref(id, view, autoFocus)
  const path = useGenreLinkPath(id)

  const { setSelectedPath } = useGenreTreeState()

  return (
    <Link href={href} {...props}>
      <a onClick={() => setSelectedPath(path)} className={className}>
        {children ?? <Name id={id} />}
      </a>
    </Link>
  )
}

const Name: FC<{ id: number }> = ({ id }) => {
  const genreQuery = useSimpleGenreQuery(id)

  if (genreQuery.data) {
    return <>{genreQuery.data.name}</>
  }

  if (genreQuery.error) {
    return <>Error</>
  }

  return <>Loading</>
}

export default GenreLink

import Link, { LinkProps } from 'next/link'
import { Query } from 'nextjs-routes'
import { FC, PropsWithChildren, useMemo } from 'react'

import { useTreeGenresMapQuery } from '../../services/genres'
import { GenrePageView, useGenrePageContext } from '../GenrePage/context'
import { GenreFormFields } from '../GenrePage/GenreForm'

export const useGenreLinkHref = (
  id: number,
  view?: GenrePageView['type'],
  autoFocus?: keyof GenreFormFields
) => {
  const { selectedPath } = useGenrePageContext()

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

  const href: { pathname: '/genres'; query: Query } = useMemo(
    () => ({
      pathname: '/genres',
      query: {
        id: id.toString(),
        ...(path ? { path: path.join('-') } : {}),
        ...(view ? { view } : {}),
        ...(autoFocus ? { focus: autoFocus } : {}),
      },
    }),
    [autoFocus, id, path, view]
  )

  return href
}

const GenreLink: FC<
  PropsWithChildren<
    Omit<LinkProps, 'href'> & {
      id: number
      view?: GenrePageView['type']
      autoFocus?: keyof GenreFormFields
    }
  >
> = ({ id, view, autoFocus, children, ...props }) => {
  const href = useGenreLinkHref(id, view, autoFocus)
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export default GenreLink

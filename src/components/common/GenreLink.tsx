import Link, { LinkProps } from 'next/link'
import { Query } from 'nextjs-routes'
import { FC, PropsWithChildren, useMemo } from 'react'

import { useTreeGenresMapQuery } from '../../services/genres'
import { GenrePageView } from '../GenrePage'
import { useGenrePageContext } from '../GenrePage/context'
import { GenreFormFields } from '../GenrePage/GenreForm'

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

  return path
}

const GenreLink: FC<
  PropsWithChildren<
    Omit<LinkProps, 'href'> & {
      id: number
      view?: GenrePageView['type']
      autoFocus?: keyof GenreFormFields
      className?: string
    }
  >
> = ({ id, view, autoFocus, children, className, ...props }) => {
  const href = useGenreLinkHref(id, view, autoFocus)
  const path = useGenreLinkPath(id)

  const { setSelectedPath } = useGenrePageContext()

  return (
    <Link href={href} {...props}>
      <a onClick={() => setSelectedPath(path)} className={className}>
        {children}
      </a>
    </Link>
  )
}

export default GenreLink

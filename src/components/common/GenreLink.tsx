import { CrudOperation } from '@prisma/client'
import { compareAsc } from 'date-fns'
import Link, { LinkProps } from 'next/link'
import { Query } from 'nextjs-routes'
import { FC, ReactNode, useMemo } from 'react'

import { useGenreHistoryQuery } from '../../services/genre-history'
import { useSimpleGenreQuery } from '../../services/genres'
import { GenrePageView } from '../GenresPage'
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

  return (
    <Link href={href} {...props}>
      <a className={className}>{children ?? <Name id={id} />}</a>
    </Link>
  )
}

const Name: FC<{ id: number }> = ({ id }) => {
  const genreQuery = useSimpleGenreQuery(id, { showToast: false })

  if (genreQuery.data) {
    return <>{genreQuery.data.name}</>
  }

  if (genreQuery.error) {
    const isMissing = genreQuery.error.message.startsWith('No genre with id')
    return isMissing ? <DeletedName id={id} /> : <>Error</>
  }

  return <>Loading</>
}

const DeletedName: FC<{ id: number }> = ({ id }) => {
  const historyQuery = useGenreHistoryQuery(id)

  const history = useMemo(
    () =>
      (historyQuery.data ?? []).sort((a, b) => {
        // always show CREATE first
        if (
          a.operation === CrudOperation.CREATE &&
          b.operation !== CrudOperation.CREATE
        ) {
          return -1
        } else if (
          b.operation === CrudOperation.CREATE &&
          a.operation !== CrudOperation.CREATE
        ) {
          return 1
        }

        return compareAsc(a.createdAt, b.createdAt)
      }),
    [historyQuery.data]
  )

  const genre = useMemo(() => {
    const latestHistory = history[history.length - 1]
    if (!latestHistory) return
    return {
      id: latestHistory.treeGenreId,
      name: latestHistory.name,
      subtitle: latestHistory.subtitle,
    }
  }, [history])

  if (historyQuery.data) {
    return genre ? <>{genre.name}</> : <>Deleted</>
  }

  if (historyQuery.error) {
    return <>Error</>
  }

  return <>Loading</>
}

export default GenreLink

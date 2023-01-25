import Link, { LinkProps } from 'next/link'
import { Query } from 'nextjs-routes'
import { FC, ReactNode, useMemo } from 'react'

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

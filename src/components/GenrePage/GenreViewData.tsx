import { CrudOperation, Permission } from '@prisma/client'
import { compareAsc } from 'date-fns'
import Link from 'next/link'
import { uniqBy } from 'ramda'
import { FC, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

import { DefaultGenre } from '../../server/db/genre/outputs'
import { DefaultGenreHistory } from '../../server/db/genre-history/outputs'
import { useSession } from '../../services/auth'
import { getGenreRelevanceText } from './common'

const GenreViewData: FC<{
  genre: DefaultGenre
  history: DefaultGenreHistory[]
}> = ({ genre, history }) => {
  const session = useSession()

  const sortedHistory = useMemo(
    () =>
      history.sort((a, b) => {
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
    [history]
  )

  const contributors = useMemo(
    () =>
      uniqBy(
        (account) => account.id,
        sortedHistory.map((h) => h.account)
      ),
    [sortedHistory]
  )

  return (
    <div className='flex-1 overflow-auto p-4'>
      <div className='flex items-center justify-between pb-4 border-b border-gray-100'>
        <div className='text-2xl font-bold text-gray-600'>{genre.name}</div>
        <Link
          href={{
            pathname: '/genres/[id]/history',
            query: { id: genre.id.toString() },
          }}
        >
          <a className='text-gray-400 text-sm hover:underline'>History</a>
        </Link>
      </div>

      <div className='space-y-3 pt-4'>
        {genre.akas.length > 0 && (
          <div>
            <label className='block text-gray-500 text-sm' htmlFor='akas'>
              AKA
            </label>
            <div id='akas'>{genre.akas.join(', ')}</div>
          </div>
        )}

        <div>
          <label className='block text-gray-500 text-sm' htmlFor='type'>
            Type
          </label>
          <div id='type' className='capitalize'>
            {genre.type.toLowerCase()}
          </div>
        </div>

        {genre.relevance !== 99 && (
          <div>
            <label className='block text-gray-500 text-sm' htmlFor='relevance'>
              Relevance
            </label>
            <div id='relevance'>
              {genre.relevance} - {getGenreRelevanceText(genre.relevance)}
            </div>
          </div>
        )}

        {genre.parentGenres.length > 0 && (
          <div>
            <label className='block text-gray-500 text-sm' htmlFor='parents'>
              Parents
            </label>
            <ul id='parents' className='comma-list'>
              {genre.parentGenres.map(({ id, name }) => (
                <li key={id}>
                  <Link
                    href={{
                      pathname: '/genres/[id]',
                      query: { id: id.toString() },
                    }}
                  >
                    <a className='text-blue-500 hover:underline font-bold'>
                      {name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {genre.influencedByGenres.length > 0 && (
          <div>
            <label className='block text-gray-500 text-sm' htmlFor='influences'>
              Influences
            </label>
            <ul id='influences' className='comma-list'>
              {genre.influencedByGenres.map(({ id, name }) => (
                <li key={id}>
                  <Link
                    href={{
                      pathname: '/genres/[id]',
                      query: { id: id.toString() },
                    }}
                  >
                    <a className='text-blue-500 hover:underline'>{name}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label
            className='block text-gray-500 text-sm'
            htmlFor='short-description'
          >
            Short Description
          </label>
          <div id='short-description'>
            {genre.shortDescription ? (
              <ReactMarkdown className='prose prose-gray'>
                {genre.shortDescription}
              </ReactMarkdown>
            ) : (
              <span>
                Missing a short description.{' '}
                {session.isLoggedIn &&
                  session.hasPermission(Permission.EDIT_GENRES) && (
                    <Link
                      href={{
                        pathname: '/genres/[id]/edit',
                        query: {
                          id: genre.id.toString(),
                          autoFocus: 'shortDescription',
                        },
                      }}
                    >
                      <a className='text-blue-500 hover:underline'>Add one.</a>
                    </Link>
                  )}
              </span>
            )}
          </div>
        </div>

        <div>
          <label
            className='block text-gray-500 text-sm'
            htmlFor='long-description'
          >
            Long Description
          </label>
          <div id='long-description'>
            {genre.longDescription ? (
              <ReactMarkdown className='prose prose-gray'>
                {genre.longDescription}
              </ReactMarkdown>
            ) : (
              <span>
                Missing a long description.{' '}
                {session.isLoggedIn &&
                  session.hasPermission(Permission.EDIT_GENRES) && (
                    <Link
                      href={{
                        pathname: '/genres/[id]/edit',
                        query: {
                          id: genre.id.toString(),
                          autoFocus: 'longDescription',
                        },
                      }}
                    >
                      <a className='text-blue-500 hover:underline'>Add one.</a>
                    </Link>
                  )}
              </span>
            )}
          </div>
        </div>

        {genre.notes && (
          <div>
            <label className='block text-gray-500 text-sm' htmlFor='notes'>
              Notes
            </label>
            <div id='notes'>
              <ReactMarkdown className='prose prose-gray'>
                {genre.notes}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div>
          <label className='block text-gray-500 text-sm' htmlFor='contributors'>
            Contributors
          </label>
          <ul id='contributors' className='comma-list'>
            {contributors.map(({ id, username }) => (
              <li key={id}>
                <Link
                  href={{
                    pathname: '/accounts/[id]',
                    query: { id: id.toString() },
                  }}
                >
                  <a className='text-blue-500 hover:underline'>{username}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GenreViewData

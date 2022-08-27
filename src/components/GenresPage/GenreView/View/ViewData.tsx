import { CrudOperation, Permission } from '@prisma/client'
import { compareAsc } from 'date-fns'
import Link from 'next/link'
import { uniqBy } from 'ramda'
import { FC, useCallback, useMemo } from 'react'

import { DefaultGenre } from '../../../../server/db/genre/outputs'
import { DefaultGenreHistory } from '../../../../server/db/genre-history/outputs'
import { useSession } from '../../../../services/auth'
import { useGenresMapQuery } from '../../../../services/genres'
import { copyTextToClipboard } from '../../../../utils/dom'
import { isNotNull } from '../../../../utils/types'
import GenreLink from '../../../common/GenreLink'
import Label from '../../../common/Label'
import Romcode from '../../../common/Romcode'
import useGenreNavigatorSettings from '../../GenreNavigator/useGenreNavigatorSettings'
import GenreTypeChip from '../../GenreTypeChip'
import {
  getFilteredInfluences,
  getFilteredParentGenres,
  getGenreRelevanceText,
} from '../../utils'

const GenreViewData: FC<{
  genre: DefaultGenre
  history: DefaultGenreHistory[]
}> = ({ genre, history }) => {
  const session = useSession()
  const { showTypeTags, genreRelevanceFilter } = useGenreNavigatorSettings()

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
        sortedHistory.map((h) => h.account).filter(isNotNull)
      ),
    [sortedHistory]
  )

  const genreMapQuery = useGenresMapQuery()
  const relationsQuery = useMemo(
    () => ({
      ...genreMapQuery,
      data: genreMapQuery.data
        ? {
            parentGenres: getFilteredParentGenres(
              genre,
              genreRelevanceFilter,
              genreMapQuery.data
            ).sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            ),
            influencedByGenres: getFilteredInfluences(
              genre,
              genreRelevanceFilter,
              genreMapQuery.data
            ).sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            ),
          }
        : undefined,
    }),
    [genre, genreMapQuery, genreRelevanceFilter]
  )

  const renderParentGenres = useCallback(() => {
    if (relationsQuery.data) {
      return (
        relationsQuery.data.parentGenres.length > 0 && (
          <div>
            <Label htmlFor='parents'>Parents</Label>
            <ul id='parents' className='comma-list'>
              {relationsQuery.data.parentGenres.map(({ id, name, type }) => (
                <li key={id}>
                  <GenreLink
                    id={id}
                    className='text-blue-500 hover:underline font-bold'
                  >
                    {name}
                    {showTypeTags && type !== 'STYLE' && (
                      <>
                        {' '}
                        <GenreTypeChip
                          type={type}
                          className='bg-blue-100 text-blue-400'
                        />
                      </>
                    )}
                  </GenreLink>
                </li>
              ))}
            </ul>
          </div>
        )
      )
    }

    if (relationsQuery.error) {
      return (
        <div>
          <Label htmlFor='parents'>Parents</Label>
          <div id='parents' className='text-red-600'>
            Error fetching parents
          </div>
        </div>
      )
    }

    return (
      <div>
        <Label htmlFor='parents'>Parents</Label>
        <div id='parents'>Loading...</div>
      </div>
    )
  }, [relationsQuery.data, relationsQuery.error, showTypeTags])

  const renderInfluences = useCallback(() => {
    if (relationsQuery.data) {
      return (
        relationsQuery.data.influencedByGenres.length > 0 && (
          <div>
            <Label htmlFor='influences'>Influences</Label>
            <ul id='influences' className='comma-list'>
              {relationsQuery.data.influencedByGenres.map(
                ({ id, name, type }) => (
                  <li key={id}>
                    <GenreLink
                      id={id}
                      className='text-blue-500 hover:underline'
                    >
                      {name}
                      {showTypeTags && type !== 'STYLE' && (
                        <>
                          {' '}
                          <GenreTypeChip
                            type={type}
                            className='bg-blue-100 text-blue-400'
                          />
                        </>
                      )}
                    </GenreLink>
                  </li>
                )
              )}
            </ul>
          </div>
        )
      )
    }

    if (relationsQuery.error) {
      return (
        <div>
          <Label htmlFor='influences'>Influences</Label>
          <div id='influences' className='text-red-600'>
            Error fetching influences
          </div>
        </div>
      )
    }

    return (
      <div>
        <Label htmlFor='influences'>Influences</Label>
        <div id='influences'>Loading...</div>
      </div>
    )
  }, [relationsQuery.data, relationsQuery.error, showTypeTags])

  return (
    <div className='flex-1 overflow-auto p-4'>
      <div className='flex items-center justify-between pb-4 border-b border-gray-100'>
        <div className='text-2xl font-bold text-gray-600'>
          {genre.name}
          {genre.subtitle && (
            <>
              {' '}
              <span className='text-lg text-gray-500'>[{genre.subtitle}]</span>
            </>
          )}
        </div>

        <button
          onClick={() => copyTextToClipboard(`[Genre${genre.id}]`)}
          className='text-gray-400 text-sm hover:underline'
        >
          [Genre{genre.id}]
        </button>
      </div>

      <div className='space-y-3 pt-4'>
        {genre.akas.length > 0 && (
          <div>
            <Label htmlFor='akas'>AKA</Label>
            <div id='akas'>
              {genre.akas
                .sort((a, b) => b.relevance - a.relevance || a.order - b.order)
                .map((aka) => aka.name)
                .join(', ')}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor='type'>Type</Label>
          <div id='type' className='capitalize'>
            {genre.type.toLowerCase()}
          </div>
        </div>

        {genre.relevance !== 99 && (
          <div>
            <Label htmlFor='relevance'>Relevance</Label>
            <div id='relevance'>
              {genre.relevance} - {getGenreRelevanceText(genre.relevance)}
            </div>
          </div>
        )}

        {renderParentGenres()}
        {renderInfluences()}

        <div>
          <Label htmlFor='short-description'>Short Description</Label>
          <div id='short-description'>
            {genre.shortDescription ? (
              <Romcode>{genre.shortDescription}</Romcode>
            ) : (
              <span>
                Missing a short description.{' '}
                {session.isLoggedIn &&
                  session.hasPermission(Permission.EDIT_GENRES) && (
                    <GenreLink
                      id={genre.id}
                      view='edit'
                      autoFocus='shortDescription'
                      className='text-blue-500 hover:underline'
                    >
                      Add one.
                    </GenreLink>
                  )}
              </span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor='long-description'>Long Description</Label>
          <div id='long-description'>
            {genre.longDescription ? (
              <Romcode>{genre.longDescription}</Romcode>
            ) : (
              <span>
                Missing a long description.{' '}
                {session.isLoggedIn &&
                  session.hasPermission(Permission.EDIT_GENRES) && (
                    <GenreLink
                      id={genre.id}
                      view='edit'
                      autoFocus='longDescription'
                      className='text-blue-500 hover:underline'
                    >
                      Add one.
                    </GenreLink>
                  )}
              </span>
            )}
          </div>
        </div>

        {genre.notes && (
          <div>
            <Label htmlFor='notes'>Notes</Label>
            <div id='notes'>
              <Romcode className='compact-prose'>{genre.notes}</Romcode>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor='contributors'>
            Contributors{' '}
            <GenreLink
              id={genre.id}
              view='history'
              className='text-blue-500 hover:underline text-xs'
            >
              (View History)
            </GenreLink>
          </Label>
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

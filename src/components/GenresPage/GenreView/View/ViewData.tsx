import useAccountSettings from '../../../../hooks/useAccountSettings'
import { DefaultGenreHistory } from '../../../../server/db/genre-history/outputs'
import { DefaultGenre } from '../../../../server/db/genre/outputs'
import { useSession } from '../../../../services/auth'
import { copyTextToClipboard } from '../../../../utils/dom'
import { makeGenreTag } from '../../../../utils/genres'
import { isNotNull } from '../../../../utils/types'
import GenreLink from '../../../common/GenreLink'
import Label from '../../../common/Label'
import Romcode from '../../../common/Romcode'
import GenreTypeChip from '../../GenreTypeChip'
import { getGenreRelevanceText } from '../../utils'
import RelevanceVoteForm from './RelevanceVoteForm'
import { CrudOperation, Permission } from '@prisma/client'
import { compareAsc } from 'date-fns'
import Link from 'next/link'
import { uniqBy } from 'ramda'
import { FC, useMemo, useState } from 'react'

const GenreViewData: FC<{
  genre: DefaultGenre
  history: DefaultGenreHistory[]
}> = ({ genre, history }) => {
  const session = useSession()
  const { showTypeTags } = useAccountSettings()

  const [showNotes, setShowNotes] = useState(false)
  const [isVoting, setVoting] = useState(false)

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
    [history],
  )

  const contributors = useMemo(
    () =>
      uniqBy(
        (account) => account.id,
        sortedHistory.map((h) => h.account).filter(isNotNull),
      ),
    [sortedHistory],
  )

  return (
    <div className='flex-1 overflow-auto'>
      <div className='flex items-center justify-between border-b border-gray-200 p-4 transition dark:border-gray-800'>
        <div className='text-2xl font-bold text-gray-600 transition dark:text-gray-400'>
          {genre.name}
          {genre.subtitle && (
            <>
              {' '}
              <span className='text-lg text-gray-500'>[{genre.subtitle}]</span>
            </>
          )}
        </div>

        <button
          onClick={() => copyTextToClipboard(makeGenreTag(genre.id))}
          className='text-sm text-gray-400 hover:underline'
        >
          [Genre{genre.id}]
        </button>
      </div>

      <div className='space-y-3 p-4'>
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

        <div>
          <Label htmlFor='relevance'>
            Relevance{' '}
            <button
              className='text-xs text-primary-500 hover:underline'
              onClick={() => setVoting(!isVoting)}
            >
              ({isVoting ? 'Cancel' : 'Vote'})
            </button>
          </Label>
          <div id='relevance'>
            {genre.relevance === 99 ? (
              <>
                None set.{' '}
                <button
                  className='text-primary-500 hover:underline'
                  onClick={() => setVoting(true)}
                >
                  Vote.
                </button>
              </>
            ) : (
              <>
                {genre.relevance} - {getGenreRelevanceText(genre.relevance)}
              </>
            )}
          </div>
          {isVoting && (
            <RelevanceVoteForm
              genreId={genre.id}
              className='mt-1'
              onClose={() => setVoting(false)}
            />
          )}
        </div>

        {genre.parentGenres.length > 0 && (
          <div>
            <Label htmlFor='parents'>Parents</Label>
            <ul id='parents' className='comma-list'>
              {genre.parentGenres.map(({ id, name, type }) => (
                <li key={id}>
                  <GenreLink
                    id={id}
                    className='font-bold text-primary-500 hover:underline'
                  >
                    {name}
                    {showTypeTags && type !== 'STYLE' && (
                      <>
                        {' '}
                        <GenreTypeChip
                          type={type}
                          className='bg-primary-100 text-primary-400'
                        />
                      </>
                    )}
                  </GenreLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        {genre.influencedByGenres.length > 0 && (
          <div>
            <Label htmlFor='influences'>Influences</Label>
            <ul id='influences' className='comma-list'>
              {genre.influencedByGenres.map(({ id, name, type }) => (
                <li key={id}>
                  <GenreLink
                    id={id}
                    className='text-primary-500 hover:underline'
                  >
                    {name}
                    {showTypeTags && type !== 'STYLE' && (
                      <>
                        {' '}
                        <GenreTypeChip
                          type={type}
                          className='bg-primary-100 text-primary-400'
                        />
                      </>
                    )}
                  </GenreLink>
                </li>
              ))}
            </ul>
          </div>
        )}

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
                      className='text-primary-500 hover:underline'
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
                      className='text-primary-500 hover:underline'
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
              {showNotes ? (
                <>
                  <Romcode>{genre.notes}</Romcode>
                  <button
                    className='text-primary-500 hover:underline'
                    onClick={() => setShowNotes(false)}
                  >
                    Hide notes
                  </button>
                </>
              ) : (
                <button
                  className='text-primary-500 hover:underline'
                  onClick={() => setShowNotes(true)}
                >
                  Show notes
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor='contributors'>
            Contributors{' '}
            <GenreLink
              id={genre.id}
              view='history'
              className='text-xs text-primary-500 hover:underline'
            >
              (View History)
            </GenreLink>
          </Label>
          <ul id='contributors' className='comma-list'>
            {contributors.map(({ id, username }) => (
              <li key={id}>
                <Link
                  href={`/accounts/${id}`}
                  className='text-primary-500 hover:underline'
                >
                  {username}
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

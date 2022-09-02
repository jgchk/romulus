import { CrudOperation } from '@prisma/client'
import { compareAsc } from 'date-fns'
import Link from 'next/link'
import { uniqBy } from 'ramda'
import { FC, useMemo } from 'react'

import { DefaultArtist } from '../../server/db/artist/output'
import { DefaultArtistHistory } from '../../server/db/artist-history/outputs'
import { useArtistHistoryQuery } from '../../services/artist-history'
import { useArtistQuery } from '../../services/artists'
import Label from '../common/Label'
import { CenteredLoader } from '../common/Loader'

const ArtistPage: FC<{ id: number }> = ({ id }) => {
  const artistQuery = useArtistQuery(id)
  const historyQuery = useArtistHistoryQuery(id)

  if (artistQuery.data && historyQuery.data) {
    return <HasData artist={artistQuery.data} history={historyQuery.data} />
  }

  if (artistQuery.error) {
    return <div>Error fetching artist :(</div>
  }
  if (historyQuery.error) {
    return <div>Error fetching artist history :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{
  artist: DefaultArtist
  history: DefaultArtistHistory[]
}> = ({ artist, history }) => {
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
      <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
        <div className='text-2xl font-bold text-gray-600'>{artist.name}</div>
        <Link
          href={{
            pathname: '/artists/[id]/history',
            query: { id: artist.id.toString() },
          }}
        >
          <a className='text-sm text-gray-400 hover:underline'>History</a>
        </Link>
      </div>

      <div className='space-y-3 pt-4'>
        {artist.akas.length > 0 && (
          <div>
            <Label htmlFor='akas'>AKA</Label>
            <div id='akas'>{artist.akas.join(', ')}</div>
          </div>
        )}

        <div>
          <Label htmlFor='contributors'>Contributors</Label>
          <ul id='contributors' className='comma-list'>
            {contributors.map(({ id, username }) => (
              <li key={id}>
                <Link
                  href={{
                    pathname: '/accounts/[id]',
                    query: { id: id.toString() },
                  }}
                >
                  <a className='text-primary-500 hover:underline'>{username}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ArtistPage

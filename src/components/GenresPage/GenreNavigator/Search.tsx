import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC } from 'react'

import { Match } from '../../../server/db/genre/outputs'
import { useSession } from '../../../services/auth'
import { useSimpleGenreSearchQuery } from '../../../services/genres'
import { CenteredLoader } from '../../common/Loader'
import GenreTypeChip from '../GenreTypeChip'
import { useSearchState } from './search-state'
import useGenreNavigatorSettings from './useGenreNavigatorSettings'

const GenreSearchResults: FC = () => {
  const filter = useSearchState((state) => state.debouncedFilter)
  const genresQuery = useSimpleGenreSearchQuery(filter)

  if (genresQuery.data) {
    return <HasData matches={genresQuery.data} />
  }

  if (genresQuery.error) {
    return (
      <div className='flex h-full w-full items-center justify-center text-error-600'>
        Error fetching results :(
      </div>
    )
  }

  return <CenteredLoader />
}

const HasData: FC<{ matches: Match[] }> = ({ matches }) => {
  const session = useSession()
  const clearFilter = useSearchState((state) => state.clearFilter)

  return (
    <div className='p-4'>
      {matches.length > 0 ? (
        matches.map((match) => (
          <SearchResult
            key={match.genre.id}
            match={match}
            clearFilter={clearFilter}
          />
        ))
      ) : (
        <div className='flex w-full flex-col items-center justify-center text-gray-400'>
          <div>No genres found.</div>
          {session.isLoggedIn &&
            session.hasPermission(Permission.EDIT_GENRES) && (
              <div>
                <Link href={{ pathname: '/genres', query: { view: 'create' } }}>
                  <a className='text-primary-500 hover:underline'>
                    Create one.
                  </a>
                </Link>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

const SearchResult: FC<{ match: Match; clearFilter: () => void }> = ({
  match: { genre, matchedAka },
  clearFilter,
}) => {
  const { showTypeTags } = useGenreNavigatorSettings()

  return (
    <Link href={{ pathname: '/genres', query: { id: genre.id.toString() } }}>
      <a
        className='block text-gray-700 hover:font-bold'
        onClick={() => clearFilter()}
      >
        {genre.name}
        {genre?.subtitle && (
          <>
            {' '}
            <span className='text-sm text-gray-600'>[{genre.subtitle}]</span>
          </>
        )}
        {matchedAka && (
          <>
            {' '}
            <span className='text-sm'>({matchedAka})</span>
          </>
        )}
        {showTypeTags && genre.type !== 'STYLE' && (
          <>
            {' '}
            <GenreTypeChip type={genre.type} />
          </>
        )}
      </a>
    </Link>
  )
}

export default GenreSearchResults

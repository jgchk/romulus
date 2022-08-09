import anyAscii from 'any-ascii'
import Link from 'next/link'
import { FC, useMemo } from 'react'
import { compareTwoStrings } from 'string-similarity'

import { DefaultGenre } from '../../server/db/genre'
import { useGenresQuery } from '../../services/genres'
import { CenteredLoader } from '../common/Loader'
import { useGenreTreeSettings } from './common'
import GenreTypeChip from './GenreTypeChip'

type Props = { filter: string; setFilter: (s: string) => void }
type Match = { genre: DefaultGenre; matchedAka?: string; weight: number }

const toFilterString = (s: string) => anyAscii(s.toLowerCase())
const getMatchWeight = (name: string, filter: string) => {
  const fName = toFilterString(name)
  const fFilter = toFilterString(filter)

  if (fName.length < 2 || fFilter.length < 2) {
    if (fName.startsWith(fFilter)) {
      return 1
    } else if (fName.includes(fFilter)) {
      return 0.5
    } else {
      return 0
    }
  }

  return compareTwoStrings(fName, fFilter)
}

const WEIGHT_THRESHOLD = 0.2

const GenreSearchResults: FC<Props> = (props) => {
  const genresQuery = useGenresQuery()

  if (genresQuery.data) {
    return <HasData {...props} allGenres={genresQuery.data} />
  }

  if (genresQuery.error) {
    return (
      <div className='w-full h-full flex items-center justify-center text-red-600'>
        Error fetching results :(
      </div>
    )
  }

  return <CenteredLoader />
}

const HasData: FC<Props & { allGenres: DefaultGenre[] }> = ({
  filter,
  setFilter,
  allGenres,
}) => {
  const matches = useMemo(() => {
    const m: Match[] = []

    for (const genre of allGenres) {
      const nameWeight = getMatchWeight(genre.name, filter)
      let match: Match = { genre, weight: nameWeight }

      for (const aka of genre.akas) {
        const akaWeight = getMatchWeight(aka, filter)
        if (akaWeight > match.weight) {
          match = {
            genre,
            matchedAka: aka,
            weight: akaWeight,
          }
        }
      }

      if (match.weight >= WEIGHT_THRESHOLD) {
        m.push(match)
      }
    }

    return m.sort(
      (a, b) =>
        b.weight - a.weight ||
        a.genre.name.toLowerCase().localeCompare(b.genre.name.toLowerCase())
    )
  }, [allGenres, filter])

  return (
    <div className='p-4'>
      {matches.map((match) => (
        <SearchResult
          key={match.genre.id}
          match={match}
          setFilter={setFilter}
        />
      ))}
    </div>
  )
}

const SearchResult: FC<{ match: Match; setFilter: Props['setFilter'] }> = ({
  match: { genre, matchedAka },
  setFilter,
}) => {
  const { showTypeTags } = useGenreTreeSettings()

  return (
    <Link
      href={{ pathname: '/genres/[id]', query: { id: genre.id.toString() } }}
    >
      <a
        className='block text-gray-700 hover:font-bold'
        onClick={() => setFilter('')}
      >
        {genre.name}
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

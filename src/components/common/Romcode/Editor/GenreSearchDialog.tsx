import useAccountSettings from '../../../../hooks/useAccountSettings'
import useDebouncedState from '../../../../hooks/useDebouncedState'
import { Match } from '../../../../server/db/genre/outputs'
import { useSimpleGenreSearchQuery } from '../../../../services/genres'
import GenreTypeChip from '../../../GenresPage/GenreTypeChip'
import Button from '../../Button'
import Dialog from '../../Dialog'
import IconButton from '../../IconButton'
import Input from '../../Input'
import { CenteredLoader } from '../../Loader'
import Tooltip from '../../Tooltip'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { RiCloseLine, RiSearchLine } from 'react-icons/ri'

const GenreSearchDialog: FC<{
  initialFilter?: string
  onClickOutside: () => void
  onClickClose: () => void
  onSelect: (match: Match) => void
}> = ({ initialFilter, onClickOutside, onClickClose, onSelect }) => {
  const [filter, setFilter] = useState(initialFilter ?? '')
  const [debouncedFilter, setDebouncedFilter] = useDebouncedState(filter, 250)

  const [page, setPage] = useState(1)

  // reset to page 1 whenever our query changes
  useEffect(() => {
    setPage(1)
  }, [debouncedFilter])

  const genresQuery = useSimpleGenreSearchQuery(debouncedFilter)

  const renderResults = useCallback(() => {
    if (genresQuery.data) {
      return (
        <HasData
          matches={genresQuery.data}
          page={page}
          onNextPage={() => setPage((p) => p + 1)}
          onSelect={onSelect}
        />
      )
    }

    if (genresQuery.error) {
      return (
        <div className='flex h-full w-full items-center justify-center text-error-600'>
          Error fetching results :(
        </div>
      )
    }

    return <CenteredLoader />
  }, [genresQuery.data, genresQuery.error, onSelect, page])

  const [ref, setRef] = useState<HTMLInputElement | null>(null)
  useEffect(() => {
    ref?.focus()
  }, [ref])

  return (
    <Dialog onClickOutside={onClickOutside}>
      <div className='flex h-96 max-h-screen w-96 flex-col space-y-2 rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'>
        <div className='flex items-center space-x-1'>
          <Input
            className='flex-1'
            ref={setRef}
            value={filter}
            onChange={setFilter}
          />
          <Tooltip tip='Search'>
            <IconButton
              type='button'
              onClick={() => {
                setDebouncedFilter(filter)
                void genresQuery.refetch()
              }}
            >
              <RiSearchLine />
            </IconButton>
          </Tooltip>
          <Tooltip tip='Close'>
            <IconButton type='button' onClick={() => onClickClose()}>
              <RiCloseLine />
            </IconButton>
          </Tooltip>
        </div>
        {renderResults()}
      </div>
    </Dialog>
  )
}

const HasData: FC<{
  matches: Match[]
  page: number
  onNextPage: () => void
  onSelect: (match: Match) => void
}> = ({ matches, page, onNextPage, onSelect }) => {
  const numVisibleMatches = useMemo(() => page * 100, [page])

  const visibleMatches = useMemo(
    () => matches.slice(0, numVisibleMatches),
    [matches, numVisibleMatches],
  )

  const showMoreButton = useMemo(
    () => numVisibleMatches < matches.length,
    [matches.length, numVisibleMatches],
  )

  return (
    <div className='flex-1 overflow-auto'>
      {matches.length > 0 ? (
        <div>
          {visibleMatches.map((match) => (
            <SearchResult
              key={match.id}
              match={match}
              onClick={() => onSelect(match)}
            />
          ))}
          {showMoreButton && (
            <div className='flex w-full justify-center'>
              <Button template='tertiary' onClick={() => onNextPage()}>
                Show More
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className='flex w-full flex-col items-center justify-center text-gray-400'>
          <div>No genres found.</div>
        </div>
      )}
    </div>
  )
}

const SearchResult: FC<{ match: Match; onClick: () => void }> = ({
  match: { genre, matchedAka },
  onClick,
}) => {
  const { showTypeTags } = useAccountSettings()

  return (
    <button
      className='block text-left text-gray-700 hover:font-bold dark:text-gray-400'
      onClick={onClick}
    >
      {genre.name}
      {genre?.subtitle && (
        <>
          {' '}
          <span className='text-sm text-gray-600 dark:text-gray-500'>
            [{genre.subtitle}]
          </span>
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
    </button>
  )
}

export default GenreSearchDialog

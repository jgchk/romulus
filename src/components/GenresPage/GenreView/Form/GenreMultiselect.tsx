import { FC, forwardRef, useMemo, useState } from 'react'

import useDebouncedState from '../../../../hooks/useDebouncedState'
import {
  useSimpleGenreQuery,
  useSimpleGenreSearchQuery,
} from '../../../../services/genres'
import Button from '../../../common/Button'
import M from '../../../common/Multiselect'
import useGenreNavigatorSettings from '../../GenreNavigator/useGenreNavigatorSettings'
import GenreTypeChip from '../../GenreTypeChip'

const PER_PAGE = 100

export type GenreMultiselectProps = {
  id?: string
  selectedIds: number[]
  excludeIds?: number[]
  onChange: (value: number[]) => void
}

const GenreMultiselect = forwardRef<HTMLInputElement, GenreMultiselectProps>(
  ({ id, selectedIds, excludeIds, onChange }, ref) => {
    const [query, setQuery] = useState('')
    const [debouncedQuery] = useDebouncedState(query, 200)

    const genreSearchQuery = useSimpleGenreSearchQuery(debouncedQuery)
    const options = useMemo(
      () =>
        genreSearchQuery.data?.filter(({ genre }) => {
          if (excludeIds && excludeIds.includes(genre.id)) return false
          if (selectedIds.includes(genre.id)) return false
          return true
        }),
      [excludeIds, genreSearchQuery.data, selectedIds]
    )

    const [page, setPage] = useState(1)

    const { showTypeTags } = useGenreNavigatorSettings()

    return (
      <M
        query={query}
        onQueryChange={setQuery}
        options={options}
        value={selectedIds.map((id) => ({ id }))}
        onChange={(s) => onChange(s.map(({ id }) => id))}
        ref={ref}
      >
        <M.Box>
          {selectedIds.map((id) => (
            <Selected key={id} id={id} />
          ))}
          <M.Input id={id} />
        </M.Box>
        <M.Options>
          {options?.slice(0, page * PER_PAGE).map((match) => (
            <M.Option key={match.id} item={match}>
              {match.genre.name}
              {match.genre.subtitle && (
                <>
                  {' '}
                  <span className='text-xs text-gray-600'>
                    [{match.genre.subtitle}]
                  </span>
                </>
              )}
              {match.matchedAka && (
                <>
                  {' '}
                  <span className='text-xs'>({match.matchedAka})</span>
                </>
              )}
              {showTypeTags && match.genre.type !== 'STYLE' && (
                <>
                  {' '}
                  <GenreTypeChip className='text-xs' type={match?.genre.type} />
                </>
              )}
            </M.Option>
          ))}
          {options && options.length > page * PER_PAGE && (
            <div className='flex w-full justify-center'>
              <Button
                type='button'
                template='secondary'
                onClick={() => setPage((p) => p + 1)}
              >
                Load More
              </Button>
            </div>
          )}
        </M.Options>
      </M>
    )
  }
)

GenreMultiselect.displayName = 'GenreMultiselect'

export default GenreMultiselect

const Selected: FC<{ id: number }> = ({ id }) => {
  const { showTypeTags } = useGenreNavigatorSettings()

  const genreQuery = useSimpleGenreQuery(id)
  const genre = useMemo(() => genreQuery.data, [genreQuery.data])

  return (
    <M.Selected item={genre ?? { id }}>
      {genre?.name ?? 'Loading...'}
      {genre?.subtitle && (
        <>
          {' '}
          <span className='text-xs text-gray-500'>[{genre.subtitle}]</span>
        </>
      )}
      {showTypeTags && genre && genre.type !== 'STYLE' && (
        <>
          {' '}
          <GenreTypeChip
            type={genre.type}
            className='bg-gray-300 text-2xs group-hover:bg-error-400 group-hover:text-error-700'
          />
        </>
      )}
    </M.Selected>
  )
}

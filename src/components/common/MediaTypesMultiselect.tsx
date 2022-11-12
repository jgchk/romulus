import { forwardRef, useMemo, useState } from 'react'

import useDebouncedState from '../../hooks/useDebouncedState'
import useIdMap from '../../hooks/useIdMap'
import {
  useMediaTypeSearchQuery,
  useMediaTypesQuery,
} from '../../services/media-types'
import Button from './Button'
import M from './Multiselect'

const PER_PAGE = 100

export type MediaTypeMultiselectProps = {
  id?: string
  selectedIds: number[]
  excludeIds?: number[]
  onChange: (value: number[]) => void
}

const MediaTypeMultiselect = forwardRef<
  HTMLInputElement,
  MediaTypeMultiselectProps
>(({ id, selectedIds, excludeIds, onChange }, ref) => {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedState(query, 200)

  const allMediaTypes = useMediaTypesQuery()
  const mediaTypesMap = useIdMap(allMediaTypes.data ?? [])

  const mediaTypeSearchQuery = useMediaTypeSearchQuery(debouncedQuery)
  const options = useMemo(
    () =>
      mediaTypeSearchQuery.data?.filter(({ mediaType }) => {
        if (excludeIds && excludeIds.includes(mediaType.id)) return false
        if (selectedIds.includes(mediaType.id)) return false
        return true
      }),
    [excludeIds, mediaTypeSearchQuery.data, selectedIds]
  )

  const [page, setPage] = useState(1)

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
        {selectedIds.map((id) => {
          const mediaType = mediaTypesMap.get(id)
          return (
            <M.Selected key={id} item={mediaType ?? { id }}>
              {mediaType?.name ?? 'Loading...'}
            </M.Selected>
          )
        })}
        <M.Input id={id} />
      </M.Box>
      <M.Options>
        {options?.slice(0, page * PER_PAGE).map((match) => (
          <M.Option key={match.id} item={match}>
            {match.mediaType.name}
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
})

MediaTypeMultiselect.displayName = 'MediaTypeMultiselect'

export default MediaTypeMultiselect

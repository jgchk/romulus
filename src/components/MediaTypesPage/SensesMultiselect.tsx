import { forwardRef, useMemo, useState } from 'react'

import useDebouncedState from '../../hooks/useDebouncedState'
import useIdMap from '../../hooks/useIdMap'
import { useSenseSearchQuery, useSensesQuery } from '../../services/senses'
import Button from '../common/Button'
import M from '../common/Multiselect'

const PER_PAGE = 100

export type SensesMultiselectProps = {
  id?: string
  selectedIds: number[]
  excludeIds?: number[]
  onChange: (value: number[]) => void
}

const SensesMultiselect = forwardRef<HTMLInputElement, SensesMultiselectProps>(
  ({ id, selectedIds, excludeIds, onChange }, ref) => {
    const [query, setQuery] = useState('')
    const [debouncedQuery] = useDebouncedState(query, 200)

    const allSenses = useSensesQuery()
    const sensesMap = useIdMap(allSenses.data ?? [])

    const senseSearchQuery = useSenseSearchQuery(debouncedQuery)
    const options = useMemo(
      () =>
        senseSearchQuery.data?.filter(({ sense }) => {
          if (excludeIds && excludeIds.includes(sense.id)) return false
          if (selectedIds.includes(sense.id)) return false
          return true
        }),
      [excludeIds, senseSearchQuery.data, selectedIds]
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
            const sense = sensesMap.get(id)
            return (
              <M.Selected key={id} item={sense ?? { id }}>
                {sense?.name ?? 'Loading...'}
              </M.Selected>
            )
          })}
          <M.Input id={id} />
        </M.Box>
        <M.Options>
          {options?.slice(0, page * PER_PAGE).map((match) => (
            <M.Option key={match.id} item={match}>
              {match.sense.name}
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

SensesMultiselect.displayName = 'SensesMultiselect'

export default SensesMultiselect

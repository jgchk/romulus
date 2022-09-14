import { range } from 'ramda'
import { forwardRef, useMemo } from 'react'

import {
  MAX_GENRE_RELEVANCE,
  MIN_GENRE_RELEVANCE,
  UNSET_GENRE_RELEVANCE,
} from '../../server/db/common/inputs'
import Select from '../common/Select'
import { getGenreRelevanceText } from './utils'

const RelevanceSelect = forwardRef<
  HTMLButtonElement,
  {
    id?: string
    value?: number
    onChange: (value: number) => void
  }
>(({ id, value, onChange }, ref) => {
  const relevanceOptions = useMemo(
    () => [
      ...range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1)
        .reverse()
        .map((r) => ({
          key: r,
          label: `${r} - ${getGenreRelevanceText(r)}`,
        })),
      { key: UNSET_GENRE_RELEVANCE, label: 'Unset' },
    ],
    []
  )

  const selectedOption = useMemo(
    () => relevanceOptions.find((ro) => ro.key === value),
    [relevanceOptions, value]
  )

  return (
    <Select
      id={id}
      ref={ref}
      options={relevanceOptions}
      value={selectedOption}
      onChange={(v) => onChange(v.key)}
    />
  )
})

RelevanceSelect.displayName = 'RelevanceSelect'

export default RelevanceSelect

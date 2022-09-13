import { range } from 'ramda'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  MAX_GENRE_RELEVANCE,
  MIN_GENRE_RELEVANCE,
  UNSET_GENRE_RELEVANCE,
} from '../../../../server/db/common/inputs'
import {
  useDeleteGenreRelevanceVoteMutation,
  useGenreRelevanceVoteMutation,
  useGenreRelevanceVoteQuery,
} from '../../../../services/genre-relevance'
import InputGroup from '../../../common/InputGroup'
import Select from '../../../common/Select'
import { getGenreRelevanceText } from '../../utils'

type RelevanceVoteFormFields = {
  relevance: number
}

const RelevanceVoteForm: FC<{ genreId: number; onClose: () => void }> = ({
  genreId,
  onClose,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    setFocus,
    setValue,
  } = useForm<RelevanceVoteFormFields>({
    defaultValues: { relevance: UNSET_GENRE_RELEVANCE },
  })

  const { mutate: vote } = useGenreRelevanceVoteMutation()
  const { mutate: deleteVote } = useDeleteGenreRelevanceVoteMutation()
  const submitHandler = useCallback(
    (data: RelevanceVoteFormFields) => {
      if (data.relevance === UNSET_GENRE_RELEVANCE) {
        return deleteVote({ genreId }, { onSuccess: () => onClose() })
      }

      vote(
        { relevance: data.relevance, genreId },
        { onSuccess: () => onClose() }
      )
    },
    [deleteVote, genreId, onClose, vote]
  )

  useEffect(() => setFocus('relevance'), [setFocus])

  const { data } = useGenreRelevanceVoteQuery(genreId)
  useEffect(() => {
    if (data !== undefined && !dirtyFields.relevance) {
      setValue(
        'relevance',
        data === null ? UNSET_GENRE_RELEVANCE : data.relevance
      )
    }
  }, [data, dirtyFields.relevance, setValue])

  const relevanceOptions = useMemo(
    () => [
      ...range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1).map((r) => ({
        key: r,
        label: `${r} - ${getGenreRelevanceText(r)}`,
      })),
      { key: UNSET_GENRE_RELEVANCE, label: 'Unset' },
    ],
    []
  )

  return (
    <form onSubmit={(e) => void handleSubmit(submitHandler)(e)}>
      <InputGroup id='relevance' error={errors.relevance}>
        <Controller
          name='relevance'
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={relevanceOptions}
              value={relevanceOptions.find((to) => to.key === field.value)}
              onChange={(v) => field.onChange(v.key)}
            />
          )}
        />
      </InputGroup>
      <button type='submit'>Vote</button>
    </form>
  )
}

export default RelevanceVoteForm

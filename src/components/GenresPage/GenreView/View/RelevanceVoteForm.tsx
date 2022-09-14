import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { UNSET_GENRE_RELEVANCE } from '../../../../server/db/common/inputs'
import {
  useDeleteGenreRelevanceVoteMutation,
  useGenreRelevanceVoteMutation,
  useGenreRelevanceVoteQuery,
} from '../../../../services/genre-relevance'
import { twsx } from '../../../../utils/dom'
import Button from '../../../common/Button'
import InputGroup from '../../../common/InputGroup'
import Label from '../../../common/Label'
import RelevanceSelect from '../../RelevanceSelect'
import RelevanceVoteGraph from './RelevanceVoteGraph'

type RelevanceVoteFormFields = {
  relevance: number
}

const RelevanceVoteForm: FC<{
  genreId: number
  className?: string
  onClose?: () => void
}> = ({ genreId, className, onClose }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    setFocus,
    setValue,
  } = useForm<RelevanceVoteFormFields>({
    defaultValues: { relevance: UNSET_GENRE_RELEVANCE },
  })

  const { mutate: vote, isLoading: isVoting } = useGenreRelevanceVoteMutation()
  const { mutate: deleteVote, isLoading: isDeletingVote } =
    useDeleteGenreRelevanceVoteMutation()
  const submitHandler = useCallback(
    (data: RelevanceVoteFormFields) => {
      if (data.relevance === UNSET_GENRE_RELEVANCE) {
        return deleteVote({ genreId })
      }

      vote({ relevance: data.relevance, genreId })
    },
    [deleteVote, genreId, vote]
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

  return (
    <div
      className={twsx(
        'rounded border border-gray-300 bg-gray-50 p-4',
        className
      )}
    >
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)}>
        <InputGroup label='Your Vote' id='relevance' error={errors.relevance}>
          <Controller
            name='relevance'
            control={control}
            render={({ field }) => (
              <div className='flex max-w-sm space-x-1'>
                <div className='flex-1'>
                  <RelevanceSelect {...field} />
                </div>
                <Button
                  template='primary'
                  type='submit'
                  loading={isVoting || isDeletingVote}
                >
                  Vote
                </Button>
                <Button template='tertiary' type='button' onClick={onClose}>
                  Cancel
                </Button>
              </div>
            )}
          />
        </InputGroup>
      </form>

      <div className='mt-4 max-w-sm space-y-0.5'>
        <Label>Results</Label>
        <RelevanceVoteGraph genreId={genreId} />
      </div>
    </div>
  )
}

export default RelevanceVoteForm

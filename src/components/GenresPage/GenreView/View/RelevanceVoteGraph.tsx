import clsx from 'clsx'
import { countBy, range } from 'ramda'
import { FC, useCallback, useMemo } from 'react'

import {
  MAX_GENRE_RELEVANCE,
  MIN_GENRE_RELEVANCE,
} from '../../../../server/db/common/inputs'
import { DefaultGenreRelevanceVote } from '../../../../server/db/genre-relevance/outputs'
import { useGenreRelevanceVotesQuery } from '../../../../services/genre-relevance'
import { CenteredLoader } from '../../../common/Loader'
import Tooltip from '../../../common/Tooltip'
import { getGenreRelevanceText } from '../../utils'

const RelevanceVoteGraph: FC<{ genreId: number; className?: string }> = ({
  genreId,
  className,
}) => {
  const votesQuery = useGenreRelevanceVotesQuery(genreId)

  if (votesQuery.data) {
    return <HasData votes={votesQuery.data} className={className} />
  }

  if (votesQuery.error) {
    return <div>Error fetching votes :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{
  votes: DefaultGenreRelevanceVote[]
  className?: string
}> = ({ votes, className }) => {
  const data = useMemo(
    () => countBy((vote: DefaultGenreRelevanceVote) => vote.relevance)(votes),
    [votes]
  )

  const getColor = useCallback((relevance: number) => {
    switch (relevance) {
      case 1:
        return 'bg-primary-100 border-y border-r border-primary-300'
      case 2:
        return 'bg-primary-200 border-y border-r border-primary-400'
      case 3:
        return 'bg-primary-300 border-y border-r border-primary-500'
      case 4:
        return 'bg-primary-400 border-y border-r border-primary-600'
      case 5:
        return 'bg-primary-500 border-y border-r border-primary-700'
      case 6:
        return 'bg-primary-600'
      case 7:
        return 'bg-primary-700'
    }
  }, [])

  return (
    <div className={className}>
      {range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1)
        .reverse()
        .map((relevance) => {
          const num = data[relevance] ?? 0
          const percentage = (num / votes.length) * 0.95

          return (
            <div key={relevance} className='flex items-center'>
              <Tooltip tip={getGenreRelevanceText(relevance)}>
                <div className='flex h-6 w-4 cursor-default items-center border-r border-gray-300 text-sm text-gray-700'>
                  {relevance}
                </div>
              </Tooltip>

              {percentage > 0 && (
                <div
                  className={clsx('h-5 rounded-r', getColor(relevance))}
                  style={{ width: `${percentage * 100}%` }}
                />
              )}

              <Tooltip tip={`${num} vote${num === 1 ? '' : 's'}`}>
                <div className='ml-2 cursor-default text-sm font-medium text-gray-700'>
                  {num}
                </div>
              </Tooltip>
            </div>
          )
        })}
    </div>
  )
}

export default RelevanceVoteGraph

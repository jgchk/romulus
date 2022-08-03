import type { NextPage } from 'next'
import { FC } from 'react'
import { trpc } from '../../utils/trpc'

const Content: FC = () => {
  const genresQuery = trpc.useQuery(['genre.all'])

  if (genresQuery.data) {
    if (genresQuery.data.length === 0) {
      return <div>No genres found</div>
    }

    return (
      <div>
        {genresQuery.data.map((genre) => (
          <div key={genre.id}>{genre.name}</div>
        ))}
      </div>
    )
  }

  if (genresQuery.error) {
    return <div>Error while fetching genres :(</div>
  }

  return <div>Loading...</div>
}

const Genres: NextPage = () => {
  return (
    <div>
      <button className='bg-blue-600 rounded-sm text-white font-bold p-1 px-4'>
        Add Genre
      </button>
      <Content />
    </div>
  )
}

export default Genres

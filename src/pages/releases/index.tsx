import type { NextPage } from 'next'
import { trpc } from '../../utils/trpc'

const Releases: NextPage = () => {
  const releasesQuery = trpc.useQuery(['release.all'])

  if (releasesQuery.data) {
    if (releasesQuery.data.length === 0) {
      return <div>No releases found</div>
    }

    return (
      <div>
        {releasesQuery.data.map((release) => (
          <div key={release.id}>{release.title}</div>
        ))}
      </div>
    )
  }

  if (releasesQuery.error) {
    return <div>Error while fetching releases :(</div>
  }

  return <div>Loading...</div>
}

export default Releases

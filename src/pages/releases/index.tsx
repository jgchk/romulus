import type { NextPage } from 'next'

import { CenteredLoader } from '../../components/common/Loader'
import { useReleasesQuery } from '../../services/releases'

const Releases: NextPage = () => {
  const releasesQuery = useReleasesQuery()

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

  return <CenteredLoader />
}

export default Releases

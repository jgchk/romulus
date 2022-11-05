import Error from 'next/error'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'

import { CenteredLoader } from '../../components/common/Loader'
import { DefaultRelease } from '../../server/db/release/outputs'
import { useReleaseQuery } from '../../services/releases'
import { useIntRouteParam } from '../../utils/routes'

const Release: FC = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      void router.push({ pathname: '/releases' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <ReleasePage id={id} />
}

const ReleasePage: FC<{ id: number }> = ({ id }) => {
  const releaseQuery = useReleaseQuery(id)

  if (releaseQuery.data) {
    return <HasData release={releaseQuery.data} />
  }

  if (releaseQuery.error) {
    return <div>Could not fetch release :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{ release: DefaultRelease }> = ({ release }) => {
  return <div>{release.title}</div>
}

export default Release

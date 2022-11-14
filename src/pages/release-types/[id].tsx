import Error from 'next/error'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'

import { CenteredLoader } from '../../components/common/Loader'
import PageDesigner from '../../components/PageDesigner'
import { useReleaseTypeQuery } from '../../services/release-types'
import { useIntRouteParam } from '../../utils/routes'

const ReleaseType: FC = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      void router.push({ pathname: '/release-types' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <ReleaseTypePage id={id} />
}

const ReleaseTypePage: FC<{ id: number }> = ({ id }) => {
  const releaseTypeQuery = useReleaseTypeQuery(id)

  if (releaseTypeQuery.data) {
    return <PageDesigner releaseType={releaseTypeQuery.data} />
  }

  if (releaseTypeQuery.error) {
    return <div>Could not fetch song :(</div>
  }

  return <CenteredLoader />
}

export default ReleaseType

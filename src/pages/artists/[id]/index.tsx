import { NextPage } from 'next'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import ArtistPage from '../../../components/ArtistPage'
import { useIntRouteParam } from '../../../utils/routes'

const Artist: NextPage = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      void router.push({ pathname: '/genres' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <ArtistPage id={id} />
}

export default Artist

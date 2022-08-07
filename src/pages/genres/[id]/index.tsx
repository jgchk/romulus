import type { NextPage } from 'next'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import GenrePage from '../../../components/GenrePage'
import { useIntRouteParam } from '../../../utils/routes'

const Genre: NextPage = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      router.push({ pathname: '/genres' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <GenrePage state={{ type: 'view', id }} />
}

export default Genre

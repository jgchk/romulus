import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useIntRouteParam } from '../../utils/routes'

const GenrePage: NextPage = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    void router.replace({ pathname: '/genres', query: { id: id?.toString() } })
  }, [id, router])

  return <div />
}

export default GenrePage

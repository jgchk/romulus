import type { NextPage } from 'next'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

import GenrePage from '../../../components/GenrePage'
import {
  fromQueryString,
  toValidInt,
  useIntRouteParam,
} from '../../../utils/routes'

const Genre: NextPage = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  const scrollTo = useMemo(() => {
    const hash = router.asPath.split('#')[1]
    const parsedHash = fromQueryString(hash)
    return toValidInt(parsedHash.get('scrollTo'))
  }, [router.asPath])

  useEffect(() => {
    if (id === undefined) {
      void router.push({ pathname: '/genres' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <GenrePage state={{ type: 'view', id, scrollTo }} />
}

export default Genre

import type { NextPage } from 'next'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

import { isGenreFormField } from '../../../components/GenreForm'
import GenrePage from '../../../components/GenrePage'
import { useIntRouteParam } from '../../../utils/routes'

const EditGenre: NextPage = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      router.push('/genres')
    }
  }, [id, router])

  const autoFocus = useMemo(() => {
    let maybeAutoFocus = router.query.autoFocus
    if (Array.isArray(maybeAutoFocus)) {
      maybeAutoFocus = maybeAutoFocus[0]
    }

    if (!maybeAutoFocus) {
      return
    }

    if (!isGenreFormField(maybeAutoFocus)) {
      return
    }

    return maybeAutoFocus
  }, [router.query.autoFocus])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <GenrePage state={{ type: 'edit', id, autoFocus }} />
}

export default EditGenre

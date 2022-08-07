import type { NextPage } from 'next'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { isGenreFormField } from '../../../components/GenreForm'
import GenrePage from '../../../components/GenrePage'
import { useCustomRouteParam, useIntRouteParam } from '../../../utils/routes'

const EditGenre: NextPage = () => {
  const id = useIntRouteParam('id')
  const autoFocus = useCustomRouteParam('autoFocus', isGenreFormField)

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      router.push('/genres')
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <GenrePage state={{ type: 'edit', id, autoFocus }} />
}

export default EditGenre

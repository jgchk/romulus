import type { NextPage } from 'next'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { isGenreFormField } from '../../../components/GenreForm'
import GenrePage from '../../../components/GenrePage'
import { useSession } from '../../../services/auth'
import { useCustomRouteParam, useIntRouteParam } from '../../../utils/routes'

const EditGenre: NextPage = () => {
  const router = useRouter()
  const id = useIntRouteParam('id')
  const autoFocus = useCustomRouteParam('autoFocus', isGenreFormField)

  // if we didn't get a valid genre id, redirect to the all genres page
  useEffect(() => {
    if (id === undefined) {
      router.push({ pathname: '/genres' })
    }
  }, [id, router])

  // navigate away from the page if the user is not logged in
  const session = useSession()
  useEffect(() => {
    if (session.isLoggedOut) {
      if (id !== undefined) {
        router.push({ pathname: '/genres/[id]', query: { id: id.toString() } })
      } else {
        router.push({ pathname: '/genres' })
      }
    }
  }, [id, router, session.isLoggedOut])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <GenrePage state={{ type: 'edit', id, autoFocus }} />
}

export default EditGenre

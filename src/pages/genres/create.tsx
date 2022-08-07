import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import GenrePage from '../../components/GenrePage'
import { useSession } from '../../services/auth'

const CreateGenre: NextPage = () => {
  // navigate away from the page if the user is not logged in
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (session.isLoggedOut) {
      router.push({ pathname: '/genres' })
    }
  }, [router, session.isLoggedOut])

  return <GenrePage state={{ type: 'create' }} />
}

export default CreateGenre

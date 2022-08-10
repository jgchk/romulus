import { Permission } from '@prisma/client'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import GenrePage from '../../components/GenrePage'
import { useSession } from '../../services/auth'

const CreateGenre: NextPage = () => {
  // navigate away from the page if the user is not logged in or the user does not have edit permissions
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (
      session.isLoggedOut ||
      session.hasPermission(Permission.EDIT_GENRES) === false
    ) {
      router.push({ pathname: '/genres' })
    }
  }, [router, session])

  return <GenrePage state={{ type: 'create' }} />
}

export default CreateGenre

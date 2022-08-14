import { Permission } from '@prisma/client'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import ReleaseCreatePage from '../../components/ReleaseCreatePage'
import { useSession } from '../../services/auth'

const CreateRelease: NextPage = () => {
  // navigate away from the page if the user is not logged in or the user does not have edit permissions
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (
      session.isLoggedOut ||
      session.hasPermission(Permission.EDIT_RELEASES) === false
    ) {
      void router.push({ pathname: '/releases' })
    }
  }, [router, session])

  return <ReleaseCreatePage />
}

export default CreateRelease

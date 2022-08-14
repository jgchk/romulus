import { Permission } from '@prisma/client'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import ArtistCreatePage from '../../components/ArtistCreatePage'
import { useSession } from '../../services/auth'

const CreateArtist: NextPage = () => {
  // navigate away from the page if the user is not logged in or the user does not have edit permissions
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (
      session.isLoggedOut ||
      session.hasPermission(Permission.EDIT_RELEASES) === false
    ) {
      void router.push({ pathname: '/artists' })
    }
  }, [router, session])

  return <ArtistCreatePage />
}

export default CreateArtist

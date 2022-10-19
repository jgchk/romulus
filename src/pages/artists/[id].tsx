import Error from 'next/error'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo } from 'react'

import { CenteredLoader } from '../../components/common/Loader'
import { DefaultArtist } from '../../server/db/artist/outputs'
import { useArtistQuery } from '../../services/artists'
import { toArtistNameString } from '../../utils/artists'
import { useIntRouteParam } from '../../utils/routes'

const Artist: FC = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      void router.push({ pathname: '/artists' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <ArtistPage id={id} />
}

const ArtistPage: FC<{ id: number }> = ({ id }) => {
  const artistQuery = useArtistQuery(id)

  if (artistQuery.data) {
    return <HasData artist={artistQuery.data} />
  }

  if (artistQuery.error) {
    return <div>Could not fetch artist :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{ artist: DefaultArtist }> = ({ artist }) => {
  const name = useMemo(() => toArtistNameString(artist), [artist])

  return <div>{name}</div>
}

export default Artist

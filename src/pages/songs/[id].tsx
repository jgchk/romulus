import Error from 'next/error'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'

import { CenteredLoader } from '../../components/common/Loader'
import { DefaultSong } from '../../server/db/song/outputs'
import { useSongQuery } from '../../services/songs'
import { useIntRouteParam } from '../../utils/routes'

const Song: FC = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      void router.push({ pathname: '/songs' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <SongPage id={id} />
}

const SongPage: FC<{ id: number }> = ({ id }) => {
  const songQuery = useSongQuery(id)

  if (songQuery.data) {
    return <HasData song={songQuery.data} />
  }

  if (songQuery.error) {
    return <div>Could not fetch song :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{ song: DefaultSong }> = ({ song }) => {
  return <div>{song.title}</div>
}

export default Song

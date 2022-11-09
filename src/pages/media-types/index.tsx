import Link from 'next/link'
import { FC } from 'react'

import Button from '../../components/common/Button'
import { CenteredLoader } from '../../components/common/Loader'
import { useMediaTypesQuery } from '../../services/media-types'

const MediaTypesPage: FC = () => {
  const mediaTypesQuery = useMediaTypesQuery()

  if (mediaTypesQuery.data) {
    return (
      <div>
        {mediaTypesQuery.data.map((mt) => (
          <div key={mt.id}>{mt.name}</div>
        ))}
        <Link href={{ pathname: '/media-types/create' }}>
          <a>
            <Button>New Media Type</Button>
          </a>
        </Link>
      </div>
    )
  }

  if (mediaTypesQuery.error) {
    return <div>Could not fetch media types :(</div>
  }

  return <CenteredLoader />
}

export default MediaTypesPage

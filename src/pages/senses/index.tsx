import Link from 'next/link'
import { FC } from 'react'

import Button from '../../components/common/Button'
import { CenteredLoader } from '../../components/common/Loader'
import { useSensesQuery } from '../../services/senses'

const SensesPage: FC = () => {
  const sensesQuery = useSensesQuery()

  if (sensesQuery.data) {
    return (
      <div>
        {sensesQuery.data.map((sense) => (
          <div key={sense.id}>{sense.name}</div>
        ))}
        <Link href={{ pathname: '/senses/create' }}>
          <a>
            <Button>New Sense</Button>
          </a>
        </Link>
      </div>
    )
  }

  if (sensesQuery.error) {
    return <div>Could not fetch senses :(</div>
  }

  return <CenteredLoader />
}

export default SensesPage

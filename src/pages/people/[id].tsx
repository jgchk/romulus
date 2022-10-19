import Error from 'next/error'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo } from 'react'

import { CenteredLoader } from '../../components/common/Loader'
import { DefaultPerson } from '../../server/db/person/outputs'
import { usePersonQuery } from '../../services/people'
import { toNameString } from '../../utils/people'
import { useIntRouteParam } from '../../utils/routes'

const Person: FC = () => {
  const id = useIntRouteParam('id')

  const router = useRouter()
  useEffect(() => {
    if (id === undefined) {
      void router.push({ pathname: '/people' })
    }
  }, [id, router])

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <PersonPage id={id} />
}

const PersonPage: FC<{ id: number }> = ({ id }) => {
  const personQuery = usePersonQuery(id)

  if (personQuery.data) {
    return <HasData person={personQuery.data} />
  }

  if (personQuery.error) {
    return <div>Could not fetch person :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{ person: DefaultPerson }> = ({ person }) => {
  const name = useMemo(() => toNameString(person), [person])

  return <div>{name}</div>
}

export default Person

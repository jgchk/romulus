import type { NextPage } from 'next'
import Error from 'next/error'
import { FC } from 'react'
import { useIntRouteParam } from '../../utils/routes'
import { trpc } from '../../utils/trpc'

const Release: FC<{ id: number }> = ({ id }) => {
  const releaseQuery = trpc.useQuery(['release.byId', { id }])

  if (releaseQuery.data) {
    return <div>{releaseQuery.data.title}</div>
  }

  if (releaseQuery.error) {
    if (releaseQuery.error.data?.code === 'NOT_FOUND') {
      return <Error statusCode={404} />
    }

    return <div>{releaseQuery.error.message}</div>
  }

  return <div>{}</div>
}

const Wrapper: NextPage = () => {
  const id = useIntRouteParam('id')

  if (id === undefined) {
    return <Error statusCode={404} />
  }

  return <Release id={id} />
}

export default Wrapper

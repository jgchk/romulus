import { GenreOperation, Permission } from '@prisma/client'
import { FC, useMemo } from 'react'

import { DefaultAccount } from '../../server/db/account'
import { DefaultGenreHistory } from '../../server/db/genre/types'
import { useAccountQuery } from '../../services/accounts'
import { useSession } from '../../services/auth'
import {
  useGenreHistoryByUserQuery,
  useMigrateContributorsMutation,
} from '../../services/genres'
import { ButtonSecondary } from '../common/Button'
import { CenteredLoader } from '../common/Loader'

const AccountPage: FC<{ id: number }> = ({ id }) => {
  const accountQuery = useAccountQuery(id)
  const genreHistoryQuery = useGenreHistoryByUserQuery(id)

  if (accountQuery.data && genreHistoryQuery.data) {
    return (
      <HasData
        account={accountQuery.data}
        genreHistory={genreHistoryQuery.data}
      />
    )
  }

  if (accountQuery.error) {
    return <div>Error fetching account :(</div>
  }
  if (genreHistoryQuery.error) {
    return <div>Error fetching contribution history :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{
  account: DefaultAccount
  genreHistory: DefaultGenreHistory[]
}> = ({ account, genreHistory }) => {
  const session = useSession()

  const { mutate: migrateContributors, isLoading: isMigrating } =
    useMigrateContributorsMutation()

  const [numGenresCreated, numGenresEdited] = useMemo(() => {
    let numCreated = 0
    let numEdited = 0

    for (const entry of genreHistory) {
      if (entry.operation === GenreOperation.CREATE) {
        numCreated += 1
      } else if (entry.operation === GenreOperation.UPDATE) {
        numEdited += 1
      }
    }

    return [numCreated, numEdited]
  }, [genreHistory])

  return (
    <div className='w-full h-full flex items-center justify-center bg-texture'>
      <div className='border p-4 shadow bg-white'>
        <div className='text-xl font-bold'>{account.username}</div>
        <div>Genres created: {numGenresCreated}</div>
        <div>Genres edited: {numGenresEdited}</div>
        {session.data?.id === account.id &&
          session.hasPermission(Permission.MIGRATE_CONTRIBUTORS) &&
          (isMigrating ? (
            <ButtonSecondary disabled>Migrating...</ButtonSecondary>
          ) : (
            <ButtonSecondary onClick={() => migrateContributors()}>
              Migrate Contributors
            </ButtonSecondary>
          ))}
      </div>
    </div>
  )
}

export default AccountPage

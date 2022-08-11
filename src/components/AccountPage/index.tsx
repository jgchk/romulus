import { GenreOperation, Permission } from '@prisma/client'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { DefaultAccount } from '../../server/db/account'
import { DefaultGenreHistory } from '../../server/db/genre/types'
import { useAccountQuery, useAccountsQuery } from '../../services/accounts'
import { useSession } from '../../services/auth'
import {
  useGenreHistoryByUserQuery,
  useGenresQuery,
  useGiveCreateCreditMutation,
  useMigrateContributorsMutation,
} from '../../services/genres'
import { ButtonPrimary, ButtonSecondary } from '../common/Button'
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

  const createdGenreIds = useMemo(
    () =>
      new Set(
        genreHistory
          .filter((h) => h.operation === GenreOperation.CREATE)
          .map((h) => h.treeGenreId)
      ),
    [genreHistory]
  )
  const editedGenreIds = useMemo(
    () =>
      new Set(
        genreHistory
          .filter((h) => h.operation === GenreOperation.UPDATE)
          .map((h) => h.treeGenreId)
      ),
    [genreHistory]
  )

  const numCreated = useMemo(() => createdGenreIds.size, [createdGenreIds.size])
  const numEdited = useMemo(() => editedGenreIds.size, [editedGenreIds.size])

  return (
    <div className='w-full h-full flex items-center justify-center bg-texture'>
      <div className='border p-4 shadow bg-white'>
        <div className='text-xl font-bold'>{account.username}</div>
        <div>Genres created: {numCreated}</div>
        <div>Genres edited: {numEdited}</div>
        {session.data?.id === account.id &&
          session.hasPermission(Permission.MIGRATE_CONTRIBUTORS) && (
            <>
              <CreateCreditForm />
              {isMigrating ? (
                <ButtonSecondary disabled>Migrating...</ButtonSecondary>
              ) : (
                <ButtonSecondary onClick={() => migrateContributors()}>
                  Migrate Contributors
                </ButtonSecondary>
              )}
            </>
          )}
      </div>
    </div>
  )
}

const CreateCreditForm: FC = () => {
  const [accountId, setAccountId] = useState<number>()
  const [genreId, setGenreId] = useState<number>()
  useEffect(() => console.log({ accountId, genreId }), [accountId, genreId])

  const accountsQuery = useAccountsQuery()
  const genresQuery = useGenresQuery()

  const sortedAccounts = useMemo(
    () =>
      (accountsQuery.data ?? []).sort((a, b) =>
        a.username.toLowerCase().localeCompare(b.username.toLowerCase())
      ),
    [accountsQuery.data]
  )

  const sortedGenres = useMemo(
    () =>
      (genresQuery.data ?? []).sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      ),
    [genresQuery.data]
  )

  useEffect(() => {
    if (sortedAccounts.length > 0 && accountId === undefined) {
      setAccountId(sortedAccounts[0].id)
    }
  }, [accountId, sortedAccounts])
  useEffect(() => {
    if (sortedGenres.length > 0 && genreId === undefined) {
      setGenreId(sortedGenres[0].id)
    }
  }, [genreId, sortedGenres])

  const { mutate, isLoading } = useGiveCreateCreditMutation()

  const handleGiveCreateCredit = useCallback(() => {
    if (accountId === undefined) {
      toast.error('You must select an account')
      return
    }
    if (genreId === undefined) {
      toast.error('You must select a genre')
      return
    }

    mutate({ accountId, genreId })
  }, [accountId, genreId, mutate])

  return (
    <div className='flex p-2 space-x-1'>
      <select
        value={accountId}
        onChange={(e) => setAccountId(Number.parseInt(e.target.value))}
      >
        {sortedAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.username}
          </option>
        ))}
      </select>

      <select
        value={genreId}
        onChange={(e) => setGenreId(Number.parseInt(e.target.value))}
      >
        {sortedGenres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name} ({genre.id})
          </option>
        ))}
      </select>

      <ButtonPrimary
        onClick={() => handleGiveCreateCredit()}
        disabled={isLoading}
      >
        {isLoading ? 'Requesting...' : 'Request'}
      </ButtonPrimary>
    </div>
  )
}

export default AccountPage

import { GenreOperation, Permission } from '@prisma/client'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { DefaultAccount } from '../../server/db/account'
import { useAccountQuery, useAccountsQuery } from '../../services/accounts'
import { useSession } from '../../services/auth'
import {
  useGenreHistoryCountByUserQuery,
  useGiveCreateCreditMutation,
} from '../../services/genre-history'
import { useSimpleGenresQuery } from '../../services/genres'
import { ButtonPrimary } from '../common/Button'
import { CenteredLoader } from '../common/Loader'
import AccountGenreHistory from './AccountGenreHistory'

const AccountPage: FC<{ id: number }> = ({ id }) => {
  const accountQuery = useAccountQuery(id)

  if (accountQuery.data) {
    return <HasData account={accountQuery.data} />
  }

  if (accountQuery.error) {
    return <div>Error fetching account :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{
  account: DefaultAccount
}> = ({ account }) => {
  const session = useSession()

  const createdCountQuery = useGenreHistoryCountByUserQuery(
    account.id,
    GenreOperation.CREATE
  )
  const editedCountQuery = useGenreHistoryCountByUserQuery(
    account.id,
    GenreOperation.UPDATE
  )
  const deletedCountQuery = useGenreHistoryCountByUserQuery(
    account.id,
    GenreOperation.DELETE
  )

  return (
    <div className='w-full h-full flex items-center justify-center bg-texture'>
      <div className='border p-4 shadow bg-white'>
        <div className='text-xl font-bold'>{account.username}</div>
        <div className='py-2'>
          <div>
            Genres created: {createdCountQuery.data?.count ?? 'Loading...'}
          </div>
          <div>
            Genres edited: {editedCountQuery.data?.count ?? 'Loading...'}
          </div>
          <div>
            Genres deleted: {deletedCountQuery.data?.count ?? 'Loading...'}
          </div>
        </div>
        <div className='h-[500px] overflow-auto'>
          <AccountGenreHistory id={account.id} />
        </div>
        {session.data?.id === account.id &&
          session.hasPermission(Permission.MIGRATE_CONTRIBUTORS) && (
            <CreateCreditForm />
          )}
      </div>
    </div>
  )
}

const CreateCreditForm: FC = () => {
  const [accountId, setAccountId] = useState<number>()
  const [genreId, setGenreId] = useState<number>()

  const accountsQuery = useAccountsQuery()
  const genresQuery = useSimpleGenresQuery()

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

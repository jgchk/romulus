import { CrudOperation, Permission } from '@prisma/client'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useBreakpoint } from '../../hooks/useBreakpoint'
import { DefaultAccount } from '../../server/db/account/outputs'
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
  const isDesktop = useBreakpoint('sm')

  if (accountQuery.data) {
    return isDesktop ? (
      <div className='w-full h-full flex items-center justify-center bg-texture p-4 min-h-0'>
        <div className='border p-4 shadow bg-white w-[500px] h-[600px]'>
          <HasData account={accountQuery.data} />
        </div>
      </div>
    ) : (
      <div className='p-4 h-full'>
        <HasData account={accountQuery.data} />
      </div>
    )
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
    CrudOperation.CREATE
  )
  const editedCountQuery = useGenreHistoryCountByUserQuery(
    account.id,
    CrudOperation.UPDATE
  )
  const deletedCountQuery = useGenreHistoryCountByUserQuery(
    account.id,
    CrudOperation.DELETE
  )

  return (
    <div className='h-full max-h-full min-h-0 flex flex-col'>
      <div className='text-xl font-bold'>{account.username}</div>

      <div className='py-2'>
        <div>
          Genres created: {createdCountQuery.data?.count ?? 'Loading...'}
        </div>
        <div>Genres edited: {editedCountQuery.data?.count ?? 'Loading...'}</div>
        <div>
          Genres deleted: {deletedCountQuery.data?.count ?? 'Loading...'}
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-auto'>
        <AccountGenreHistory id={account.id} />
      </div>

      {session.data?.id === account.id &&
        session.hasPermission(Permission.MIGRATE_CONTRIBUTORS) && (
          <CreateCreditForm />
        )}
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

import { CrudOperation } from '@prisma/client'
import clsx from 'clsx'
import { FC } from 'react'

import { DefaultAccount } from '../../server/db/account/outputs'
import { useAccountQuery } from '../../services/accounts'
import { useGenreHistoryCountByUserQuery } from '../../services/genre-history'
import { CenteredLoader } from '../common/Loader'
import AccountGenreHistory from './AccountGenreHistory'

const AccountPage: FC<{ id: number }> = ({ id }) => {
  const accountQuery = useAccountQuery(id)

  if (accountQuery.data) {
    return (
      <div
        className={clsx(
          'h-full min-h-0 p-4',
          'sm:bg-texture sm:flex sm:w-full sm:items-center sm:justify-center'
        )}
      >
        <div
          className={clsx(
            'h-full',
            'sm:h-[600px] sm:w-[500px] sm:border sm:bg-white sm:p-4 sm:shadow'
          )}
        >
          <HasData account={accountQuery.data} />
        </div>
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
    <div className='flex h-full max-h-full min-h-0 flex-col'>
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

      <div className='min-h-0 flex-1 overflow-auto'>
        <AccountGenreHistory id={account.id} />
      </div>
    </div>
  )
}

export default AccountPage

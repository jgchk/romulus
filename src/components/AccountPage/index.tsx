import { CrudOperation } from '@prisma/client'
import { FC } from 'react'

import { useBreakpoint } from '../../hooks/useBreakpoint'
import { DefaultAccount } from '../../server/db/account/outputs'
import { useAccountQuery } from '../../services/accounts'
import { useGenreHistoryCountByUserQuery } from '../../services/genre-history'
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
    </div>
  )
}

export default AccountPage

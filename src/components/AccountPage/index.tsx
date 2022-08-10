import { FC } from 'react'

import { DefaultAccount } from '../../server/db/account'
import { useAccountQuery } from '../../services/accounts'
import { CenteredLoader } from '../common/Loader'

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

const HasData: FC<{ account: DefaultAccount }> = ({ account }) => (
  <div className='w-full h-full flex items-center justify-center bg-texture'>
    <div className='border p-4 shadow bg-white'>
      <div className='text-xl font-bold'>{account.username}</div>
      <div>Genres edited: {account.genresEdited.length}</div>
    </div>
  </div>
)

export default AccountPage

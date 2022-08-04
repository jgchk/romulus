import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useSession } from '../services/auth'

const Navbar: FC = () => {
  const session = useSession()

  const renderUsername = useCallback(() => {
    if (session.isSuccess) {
      return session.data ? (
        session.data.username
      ) : (
        <Link href='/login'>
          <a>Log in</a>
        </Link>
      )
    }

    if (session.error) {
      return (
        <Link href='/login'>
          <a>Log in</a>
        </Link>
      )
    }

    return 'Loading...'
  }, [session.data, session.error, session.isSuccess])

  return (
    <div className='flex space-x-2 p-2 px-4 border-b'>
      <div>{renderUsername()}</div>
      <Link href='/genres'>
        <a>Tree</a>
      </Link>
      <Link href='/genres/canvas'>
        <a>Canvas</a>
      </Link>
    </div>
  )
}

export default Navbar

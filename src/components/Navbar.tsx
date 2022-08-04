import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useSession } from '../services/auth'

const Navbar: FC = () => {
  const session = useSession()

  const renderLoginLinks = useCallback(
    () => (
      <>
        <Link href='/login'>
          <a>Log in</a>
        </Link>
        <Link href='/register'>
          <a>Register</a>
        </Link>
      </>
    ),
    []
  )

  const renderSession = useCallback(() => {
    if (session.isSuccess) {
      return session.data ? session.data.username : renderLoginLinks()
    }

    if (session.error) {
      return renderLoginLinks()
    }

    return 'Loading...'
  }, [renderLoginLinks, session.data, session.error, session.isSuccess])

  return (
    <div className='flex justify-between p-2 px-4 border-b'>
      <div className='flex space-x-2'>
        <Link href='/genres'>
          <a>Genres</a>
        </Link>
      </div>

      <div className='flex space-x-2'>{renderSession()}</div>
    </div>
  )
}

export default Navbar

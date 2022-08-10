import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useLogoutMutation, useSession } from '../services/auth'

const Navbar: FC = () => {
  const session = useSession()

  const { mutate: logout } = useLogoutMutation()

  const renderLoginLinks = useCallback(
    () => (
      <>
        <Link href={{ pathname: '/login' }}>
          <a>Log in</a>
        </Link>
        <Link href={{ pathname: '/register' }}>
          <a>Register</a>
        </Link>
      </>
    ),
    []
  )

  const renderSession = useCallback(() => {
    if (session.isSuccess) {
      return session.data ? (
        <>
          <Link
            href={{
              pathname: '/accounts/[id]',
              query: { id: session.data.id.toString() },
            }}
          >
            <a>{session.data.username}</a>
          </Link>
          <button onClick={() => logout()}>Log out</button>
        </>
      ) : (
        renderLoginLinks()
      )
    }

    if (session.error) {
      return renderLoginLinks()
    }

    return 'Loading...'
  }, [logout, renderLoginLinks, session.data, session.error, session.isSuccess])

  return (
    <div className='flex justify-between p-2 px-4 border-b'>
      <div className='flex space-x-2'>
        <Link href={{ pathname: '/genres' }}>
          <a>Genres</a>
        </Link>
      </div>

      <div className='flex space-x-2'>{renderSession()}</div>
    </div>
  )
}

export default Navbar

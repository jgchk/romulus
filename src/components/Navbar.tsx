import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useLogoutMutation, useSession } from '../services/auth'
import { useRefererRouteParam } from '../utils/routes'

const Navbar: FC = () => {
  const session = useSession()

  const { mutate: logout } = useLogoutMutation()

  const referer = useRefererRouteParam()
  const renderLoginLinks = useCallback(
    () => (
      <>
        <Link href={{ pathname: '/login', query: { referer } }}>
          <a>Log in</a>
        </Link>
        <Link
          href={{
            pathname: '/register',
            query: { referer },
          }}
        >
          <a>Register</a>
        </Link>
      </>
    ),
    [referer]
  )

  const renderSession = useCallback(() => {
    if (session.isSuccess) {
      return session.data ? (
        <>
          <span>{session.data.username}</span>
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
        <Link href='/genres'>
          <a>Genres</a>
        </Link>
      </div>

      <div className='flex space-x-2'>{renderSession()}</div>
    </div>
  )
}

export default Navbar

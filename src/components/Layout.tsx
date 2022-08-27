import { FC, PropsWithChildren, useEffect, useMemo } from 'react'
import { Toaster } from 'react-hot-toast'

import { useSession } from '../services/auth'
import Navbar from './Navbar'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const session = useSession()

  const darkMode = useMemo(
    () => session.account?.darkMode ?? true,
    [session.account?.darkMode]
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className='w-screen h-screen flex flex-col'>
      <Navbar />

      <div className='flex-1 min-h-0'>{children}</div>

      <Toaster />
    </div>
  )
}

export default Layout

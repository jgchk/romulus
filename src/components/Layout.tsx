import { FC, PropsWithChildren, useEffect, useMemo } from 'react'
import { Toaster } from 'react-hot-toast'

import { useSession } from '../services/auth'
import ClientOnly from './common/ClientOnly'
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
    <div className='flex h-screen w-screen flex-col'>
      <Navbar />

      <div className='min-h-0 flex-1 overflow-auto'>{children}</div>

      <ClientOnly>
        <Toaster />
      </ClientOnly>
    </div>
  )
}

export default Layout

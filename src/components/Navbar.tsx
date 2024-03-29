'use client'

import { useLogoutMutation, useSession } from '../services/auth'
import DarkModeButton from './DarkModeButton'
import Button from './common/Button'
import Card from './common/Card'
import Loader from './common/Loader'
import Popover from './common/Popover'
import Link from 'next/link'
import { FC, useState } from 'react'
import {
  RiArrowDownSLine,
  RiLogoutBoxLine,
  RiProfileLine,
} from 'react-icons/ri'

const linkButtonClass =
  'h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800'

const Navbar: FC = () => {
  return (
    <div className='flex justify-between p-2'>
      <Card className='flex p-1 text-sm font-bold tracking-wide text-gray-600 transition dark:text-gray-300'>
        <Link href='/genres' className={linkButtonClass}>
          Tree
        </Link>
        <Link href='/genres/table' className={linkButtonClass}>
          Table
        </Link>
      </Card>

      <Session />
    </div>
  )
}

const Session = () => {
  const session = useSession()

  const { mutate: logout } = useLogoutMutation()

  const [open, setOpen] = useState(false)

  const renderContent = () => {
    if (session.account) {
      return (
        <Popover show={open} options={{ placement: 'bottom-end' }}>
          <Popover.Target className='h-full w-full'>
            <button
              className='group/account-button h-full w-full p-1'
              onClick={() => setOpen(!open)}
            >
              <div className='flex h-full items-center gap-1 rounded px-2 pr-1 transition group-hover/account-button:bg-gray-200 dark:group-hover/account-button:bg-gray-800'>
                <div>{session.account.username}</div>
                <RiArrowDownSLine
                  size={18}
                  className='relative top-px text-gray-500 dark:text-gray-400'
                />
              </div>
            </button>
          </Popover.Target>

          <Popover.Content onClickOutside={() => setOpen(false)}>
            <Card className='shadow'>
              <Link
                href={`/accounts/${session.account.id}`}
                onClick={() => setOpen(false)}
              >
                <Button
                  template='tertiary'
                  className='flex w-full items-center justify-start gap-1.5 text-gray-600 dark:text-gray-300'
                >
                  <RiProfileLine />
                  <div>Profile</div>
                </Button>
              </Link>
              <DarkModeButton />
              <Button
                template='tertiary'
                className='flex w-full items-center justify-start gap-1.5 text-gray-600 dark:text-gray-300'
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
              >
                <RiLogoutBoxLine />
                <div>Log out</div>
              </Button>
            </Card>
          </Popover.Content>
        </Popover>
      )
    }

    if (session.account === null || session.error) {
      return (
        <div className='flex h-full p-1'>
          <Link href='/login' className={linkButtonClass}>
            Log in
          </Link>
          <Link href='/register' className={linkButtonClass}>
            Register
          </Link>
        </div>
      )
    }

    return <Loader size={16} />
  }

  return (
    <Card className='text-sm font-bold tracking-wide text-gray-600 transition dark:text-gray-300'>
      {renderContent()}
    </Card>
  )
}

export default Navbar

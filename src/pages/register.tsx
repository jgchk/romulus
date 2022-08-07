import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { ButtonPrimary } from '../components/common/Button'
import { useRegisterMutation, useSession } from '../services/auth'
import { showErrorToast } from '../utils/error'
import { useAutoFocus } from '../utils/hooks'
import { useStringRouteParam } from '../utils/routes'

const Register: NextPage = () => {
  // navigate away from the page if the user is already logged in
  const session = useSession()
  const router = useRouter()
  const referer = useStringRouteParam('referer')
  useEffect(() => {
    if (session.isLoggedIn) {
      router.push(referer ?? '/genres')
    }
  }, [referer, router, session.isLoggedIn])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { mutate: register } = useRegisterMutation()

  const handleRegister = useCallback(() => {
    if (password !== confirmPassword) {
      showErrorToast('Passwords do not match')
      return
    }

    register({ username, password })
  }, [confirmPassword, password, register, username])

  const usernameInput = useAutoFocus<HTMLInputElement>()

  return (
    <div className='w-full h-full flex items-center justify-center bg-texture'>
      <form
        className='border p-4 shadow bg-white'
        onSubmit={(e) => {
          e.preventDefault()
          handleRegister()
        }}
      >
        <div className='space-y-3'>
          <div>
            <label className='block text-gray-700 text-sm' htmlFor='username'>
              Username
            </label>
            <input
              ref={usernameInput}
              className='border rounded-sm p-1 px-2 mt-0.5'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className='block text-gray-700 text-sm' htmlFor='password'>
              Password
            </label>
            <input
              className='border rounded-sm p-1 px-2 mt-0.5'
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className='block text-gray-700 text-sm'
              htmlFor='confirm-password'
            >
              Confirm Password
            </label>
            <input
              className='border rounded-sm p-1 px-2 mt-0.5'
              id='confirm-password'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <ButtonPrimary className='w-full mt-4' type='submit'>
          Register
        </ButtonPrimary>

        <div className='mt-3 text-sm text-gray-700'>
          Already have an account?{' '}
          <Link
            href={{
              pathname: '/login',
              query: { referer },
            }}
          >
            <a className='text-blue-500 hover:underline'>Log in.</a>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Register

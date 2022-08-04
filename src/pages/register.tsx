import { NextPage } from 'next'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAutoFocus } from '../utils/hooks'
import { showErrorToast } from '../utils/error'
import { useRouter } from 'next/router'
import { useRegisterMutation, useSession } from '../services/auth'

const Register: NextPage = () => {
  // navigate away from the page if the user is already logged in
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (session.isLoggedIn) {
      router.push('/genres')
    }
  }, [router, session.isLoggedIn])

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

        <button
          className='w-full bg-blue-600 rounded-sm text-white font-bold p-1 mt-4'
          type='submit'
        >
          Register
        </button>

        <div className='mt-3 text-sm text-gray-700'>
          Already have an account?{' '}
          <Link href='/login'>
            <a className='text-blue-500 hover:underline'>Log in.</a>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Register

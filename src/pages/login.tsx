import clsx from 'clsx'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ButtonPrimary } from '../components/common/Button'
import { useLoginMutation, useSession } from '../services/auth'

type LoginFormFields = {
  username: string
  password: string
}

const Login: NextPage = () => {
  // navigate away from the page if the user is already logged in
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (session.isLoggedIn) {
      router.push({ pathname: '/genres' })
    }
  }, [router, session.isLoggedIn])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormFields>()

  const { mutate } = useLoginMutation()
  const onSubmit = useCallback(
    (data: LoginFormFields) => mutate(data),
    [mutate]
  )

  useEffect(() => setFocus('username'), [setFocus])

  return (
    <div className='w-full h-full flex items-center justify-center bg-texture'>
      <form
        className='border p-4 shadow bg-white'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='space-y-3'>
          <div>
            <label
              className={clsx(
                'block text-gray-700 text-sm',
                errors.username && 'text-red-600'
              )}
              htmlFor='username'
            >
              Username
            </label>
            <input
              id='username'
              className={clsx(
                'border rounded-sm p-1 px-2 mt-0.5',
                errors.username && 'border-red-600 outline-red-600'
              )}
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <div className='text-sm text-red-600'>
                {errors.username.message}
              </div>
            )}
          </div>

          <div>
            <label
              className={clsx(
                'block text-gray-700 text-sm',
                errors.password && 'text-red-600'
              )}
              htmlFor='password'
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              className={clsx(
                'border rounded-sm p-1 px-2 mt-0.5',
                errors.password && 'border-red-600 outline-red-600'
              )}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <div className='text-sm text-red-600'>
                {errors.password.message}
              </div>
            )}
          </div>
        </div>

        <ButtonPrimary className='w-full mt-4' type='submit'>
          Login
        </ButtonPrimary>

        <div className='mt-3 text-sm text-gray-700'>
          Need an account?{' '}
          <Link href={{ pathname: '/register' }}>
            <a className='text-blue-500 hover:underline'>Register.</a>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login

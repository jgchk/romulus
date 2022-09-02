import clsx from 'clsx'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import Button from '../components/common/Button'
import Label from '../components/common/Label'
import { useRegisterMutation, useSession } from '../services/auth'

type RegisterFormFields = {
  username: string
  password: string
  confirmPassword: string
}

const Register: NextPage = () => {
  // navigate away from the page if the user is already logged in
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (session.isLoggedIn) {
      void router.push({ pathname: '/genres' })
    }
  }, [router, session.isLoggedIn])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    watch,
  } = useForm<RegisterFormFields>()

  const { mutate, isLoading } = useRegisterMutation()
  const onSubmit = useCallback(
    (data: RegisterFormFields) => mutate(data),
    [mutate]
  )

  useEffect(() => setFocus('username'), [setFocus])

  return (
    <div className='bg-texture flex h-full w-full items-center justify-center'>
      <form
        className='border bg-white p-4 shadow'
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      >
        <div className='space-y-3'>
          <div>
            <Label htmlFor='username' error={errors.username}>
              Username
            </Label>
            <input
              id='username'
              className={clsx(
                'mt-0.5 rounded-sm border p-1 px-2',
                errors.username && 'border-error-600 outline-error-600'
              )}
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <div className='text-sm text-error-600'>
                {errors.username.message}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor='password' error={errors.password}>
              Password
            </Label>
            <input
              id='password'
              type='password'
              className={clsx(
                'mt-0.5 rounded-sm border p-1 px-2',
                errors.password && 'border-error-600 outline-error-600'
              )}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <div className='text-sm text-error-600'>
                {errors.password.message}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor='confirm-password' error={errors.confirmPassword}>
              Confirm Password
            </Label>
            <input
              type='password'
              id='confirm-password'
              className={clsx(
                'mt-0.5 rounded-sm border p-1 px-2',
                errors.confirmPassword && 'border-error-600 outline-error-600'
              )}
              {...register('confirmPassword', {
                required: 'Password confirmation is required',
                validate: (value) =>
                  watch('password') === value || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <div className='text-sm text-error-600'>
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
        </div>

        <Button className='mt-4 w-full' type='submit' loading={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>

        <div className='mt-3 text-sm text-gray-700'>
          Already have an account?{' '}
          <Link href={{ pathname: '/login' }}>
            <a className='text-primary-500 hover:underline'>Log in.</a>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Register

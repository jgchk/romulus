import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import Button from '../components/common/Button'
import Input from '../components/common/Input'
import InputGroup from '../components/common/InputGroup'
import useDebouncedState from '../hooks/useDebouncedState'
import { useAccountByUsernameQuery } from '../services/accounts'
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
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
    setError,
    watch,
  } = useForm<RegisterFormFields>()

  const { mutate, isLoading } = useRegisterMutation()
  const onSubmit = useCallback(
    (data: RegisterFormFields) => mutate(data),
    [mutate]
  )

  useEffect(() => setFocus('username'), [setFocus])

  const [debouncedUsername] = useDebouncedState(watch('username'), 200)
  const accountQuery = useAccountByUsernameQuery(debouncedUsername)
  useEffect(() => {
    if (accountQuery.data?.username) {
      setError('username', { type: 'validate', message: 'Username is taken' })
    }
  }, [accountQuery.data?.username, setError])

  return (
    <div className='bg-texture flex h-full w-full items-center justify-center'>
      <form
        className='border bg-white p-4 shadow'
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      >
        <div className='space-y-3'>
          <InputGroup id='username' label='Username' error={errors.username}>
            <Controller
              name='username'
              control={control}
              rules={{ required: 'Username is required' }}
              render={({ field }) => <Input {...field} />}
            />
          </InputGroup>

          <InputGroup id='password' label='Password' error={errors.password}>
            <Controller
              name='password'
              control={control}
              rules={{ required: 'Password is required' }}
              render={({ field }) => <Input type='password' {...field} />}
            />
          </InputGroup>

          <InputGroup
            id='confirm-password'
            label='Confirm Password'
            error={errors.confirmPassword}
          >
            <Controller
              name='confirmPassword'
              control={control}
              rules={{
                required: 'Password confirmation is required',
                validate: (value) =>
                  watch('password') === value || 'Passwords do not match',
              }}
              render={({ field }) => <Input type='password' {...field} />}
            />
          </InputGroup>
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

import { NextPage } from 'next'
import { useState } from 'react'
import { useMutation } from 'react-query'
import ky from 'ky'
import Link from 'next/link'
import { useAutoFocus } from '../utils/hooks'

const Register: NextPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { mutate: register } = useMutation(
    () => ky.post('/api/register', { json: { username, password } }),
    {
      onSuccess: (data) => {
        console.log({ data })
      },
    }
  )

  const usernameInput = useAutoFocus<HTMLInputElement>()

  return (
    <div className='w-full h-full flex items-center justify-center bg-texture'>
      <form
        className='border p-4 shadow bg-white'
        onSubmit={(e) => {
          e.preventDefault()
          register()
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

import { NextPage } from 'next'
import { useState } from 'react'
import { useMutation } from 'react-query'
import ky from 'ky'

const Register: NextPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { mutate: login } = useMutation(
    () => ky.post('/api/register', { json: { username, password } }),
    {
      onSuccess: (data) => {
        console.log({ data })
      },
    }
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        login()
      }}
    >
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type='submit'>Register</button>
    </form>
  )
}

export default Register

import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'

import { useAddReleaseMutation } from '../../services/releases'

const SubmitRelease: NextPage = () => {
  const router = useRouter()

  const [title, setTitle] = useState('')

  const addReleaseMutation = useAddReleaseMutation()

  const handleSubmitRelease = useCallback(
    () =>
      addReleaseMutation.mutate(
        { title },
        {
          onSuccess: (data) => {
            router.push(`/releases/${data.id}`)
          },
        }
      ),
    [addReleaseMutation, router, title]
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmitRelease()
      }}
    >
      <label htmlFor='title'>Title</label>
      <input
        id='title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type='submit'>Submit</button>
    </form>
  )
}

export default SubmitRelease
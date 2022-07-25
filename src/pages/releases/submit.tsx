import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { trpc } from '../../utils/trpc'

const SubmitRelease: NextPage = () => {
  const router = useRouter()

  const [title, setTitle] = useState('')

  const addReleaseMutation = trpc.useMutation('release.add')

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

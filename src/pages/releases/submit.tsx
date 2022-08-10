import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'

import { ButtonPrimary } from '../../components/common/Button'
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
          onSuccess: async (data) => {
            await router.push({
              pathname: '/releases/[id]',
              query: { id: data.id.toString() },
            })
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
      <ButtonPrimary type='submit'>Submit</ButtonPrimary>
    </form>
  )
}

export default SubmitRelease

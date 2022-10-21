import { useRouter } from 'next/router'
import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import InputGroup from '../../components/common/InputGroup'
import { useAddSongMutation } from '../../services/songs'

type CreateSongFormFields = {
  title: string
}

const CreateSong: FC = () => {
  // TODO: navigate to people index & show error notification when no EDIT_ARTIST permission
  const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
  } = useForm<CreateSongFormFields>({ defaultValues: { title: '' } })

  const { mutate, isLoading } = useAddSongMutation()
  const onSubmit = useCallback(
    (data: CreateSongFormFields) => {
      const processedData = {
        title: data.title,
      }
      return mutate(processedData, {
        onSuccess: (data) => {
          toast.success(`Created song '${data.title}'`)
          void router.push({
            pathname: '/songs/[id]',
            query: { id: data.id.toString() },
          })
        },
      })
    },
    [mutate, router]
  )

  useEffect(() => setFocus('title'), [setFocus])

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
      <InputGroup id='title' label='Title' error={errors.title} required>
        <Controller
          name='title'
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field }) => <Input {...field} />}
        />
      </InputGroup>

      <Button type='submit' loading={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}

export default CreateSong

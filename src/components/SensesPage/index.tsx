import { useRouter } from 'next/router'
import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useAddSenseMutation } from '../../services/senses'
import Button from '../common/Button'
import Input from '../common/Input'
import InputGroup from '../common/InputGroup'

type CreateSenseFormFields = {
  name: string
}

const CreateSense: FC = () => {
  // TODO: navigate to sense index & show error notification when no EDIT_RELEASE_TYPE permission
  const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
  } = useForm<CreateSenseFormFields>({
    defaultValues: { name: '' },
  })

  const { mutate, isLoading } = useAddSenseMutation()
  const onSubmit = useCallback(
    (data: CreateSenseFormFields) => {
      const processedData = {
        ...data,
      }
      return mutate(processedData, {
        onSuccess: (data) => {
          toast.success(`Created sense '${data.name}'`)
          void router.push({ pathname: '/senses' })
        },
      })
    },
    [mutate, router]
  )

  useEffect(() => setFocus('name'), [setFocus])

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
      <InputGroup id='name' label='Name' error={errors.name} required>
        <Controller
          name='name'
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => <Input {...field} />}
        />
      </InputGroup>

      <Button type='submit' loading={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}

export default CreateSense

import { useRouter } from 'next/router'
import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import InputGroup from '../../components/common/InputGroup'
import { useAddReleaseTypeMutation } from '../../services/release-types'

type CreateReleaseTypeFormFields = {
  name: string
}

const CreateReleaseType: FC = () => {
  // TODO: navigate to people index & show error notification when no EDIT_RELEASE_TYPE permission
  const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
  } = useForm<CreateReleaseTypeFormFields>({ defaultValues: { name: '' } })

  const { mutate, isLoading } = useAddReleaseTypeMutation()
  const onSubmit = useCallback(
    (data: CreateReleaseTypeFormFields) => {
      const processedData = {
        name: data.name,
      }
      return mutate(processedData, {
        onSuccess: (data) => {
          toast.success(`Created release type '${data.name}'`)
          void router.push({
            pathname: '/release-types/[id]',
            query: { id: data.id.toString() },
          })
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

export default CreateReleaseType

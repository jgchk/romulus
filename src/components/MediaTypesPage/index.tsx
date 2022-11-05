import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useAddMediaTypeMutation } from '../../services/media-types'
import Button from '../common/Button'
import Input from '../common/Input'
import InputGroup from '../common/InputGroup'
import MediaTypeMultiselect from './MediaTypesMultiselect'

type CreateMediaTypeFormFields = {
  name: string
  parents: number[]
  coreSenses: number[]
  auxSenses: number[]
}

const CreateMediaType: FC = () => {
  // TODO: navigate to media type index & show error notification when no EDIT_RELEASE_TYPE permission
  // const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
  } = useForm<CreateMediaTypeFormFields>({
    defaultValues: { name: '', parents: [], coreSenses: [], auxSenses: [] },
  })

  const { mutate, isLoading } = useAddMediaTypeMutation()
  const onSubmit = useCallback(
    (data: CreateMediaTypeFormFields) => {
      const processedData = {
        ...data,
      }
      return mutate(processedData, {
        onSuccess: (data) => {
          toast.success(`Created media type '${data.name}'`)
          // void router.push({
          //   pathname: '/media-types/[id]',
          //   query: { id: data.id.toString() },
          // })
        },
      })
    },
    [mutate]
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

      <InputGroup id='parents' label='Parents'>
        <Controller
          name='parents'
          control={control}
          render={({ field }) => (
            <MediaTypeMultiselect selectedIds={field.value} {...field} />
          )}
        />
      </InputGroup>

      <Button type='submit' loading={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}

export default CreateMediaType

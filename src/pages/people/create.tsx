import { useRouter } from 'next/router'
import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import InputGroup from '../../components/common/InputGroup'
import { useAddPersonMutation } from '../../services/people'
import { toPersonNameString } from '../../utils/people'

type CreatePersonFormFields = {
  firstName: string
  middleName: string
  lastName: string
}

const CreatePerson: FC = () => {
  // TODO: navigate to people index & show error notification when no EDIT_ARTIST permission
  const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
  } = useForm<CreatePersonFormFields>()

  const { mutate, isLoading } = useAddPersonMutation()
  const onSubmit = useCallback(
    (data: CreatePersonFormFields) => {
      const processedData = {
        firstName: data.firstName || undefined,
        middleName: data.middleName || undefined,
        lastName: data.lastName || undefined,
      }
      return mutate(processedData, {
        onSuccess: (data) => {
          toast.success(`Created person '${toPersonNameString(data)}'`)
          void router.push({
            pathname: '/people/[id]',
            query: { id: data.id.toString() },
          })
        },
      })
    },
    [mutate, router]
  )

  useEffect(() => setFocus('firstName'), [setFocus])

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
      <InputGroup id='first-name' label='First Name' error={errors.firstName}>
        <Controller
          name='firstName'
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </InputGroup>
      <InputGroup id='middle-name' label='Middle Name' error={errors.firstName}>
        <Controller
          name='middleName'
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </InputGroup>
      <InputGroup id='last-name' label='Last Name' error={errors.lastName}>
        <Controller
          name='lastName'
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </InputGroup>

      {/* TODO: memberOf input */}

      <Button type='submit' loading={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}

export default CreatePerson

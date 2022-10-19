import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import InputGroup from '../../components/common/InputGroup'
import Select, { SelectProps } from '../../components/common/Select'
import { useAddArtistMutation } from '../../services/artists'
import { usePeopleQuery } from '../../services/people'
import { toArtistNameString } from '../../utils/artists'
import { toPersonNameString } from '../../utils/people'

type CreateArtistFormFields = {
  name?: string
  members?: MemberFormFields[]
}

type MemberFormFields = {
  personId?: number
  name?: string
}

const CreateArtist: FC = () => {
  // TODO: navigate to artists index & show error notification when no EDIT_ARTIST permission
  const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
  } = useForm<CreateArtistFormFields>()

  const { mutate, isLoading } = useAddArtistMutation()
  const onSubmit = useCallback(
    (data: CreateArtistFormFields) => {
      const processedData = {
        name: data.name || undefined,
        members: (data.members ?? [])
          .filter(
            (
              member
            ): member is Exclude<MemberFormFields, 'personId'> & {
              personId: NonNullable<MemberFormFields['personId']>
            } => member.personId !== undefined
          )
          .map((member) => ({
            personId: member.personId,
            name: member.name ?? undefined,
          })),
      }
      return mutate(processedData, {
        onSuccess: (data) => {
          toast.success(`Created artist '${toArtistNameString(data)}'`)
          void router.push({
            pathname: '/artists/[id]',
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
      <InputGroup id='name' label='Name' error={errors.name}>
        <Controller
          name='name'
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </InputGroup>

      {/* TODO: members input */}
      <InputGroup id='members' label='Members'>
        <Controller
          name='members'
          control={control}
          render={({ field }) => <MembersInput {...field} />}
        />
      </InputGroup>

      <Button type='submit' loading={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}

const MembersInput: FC<{
  value?: MemberFormFields[]
  onChange: (members: MemberFormFields[]) => void
}> = ({ value, onChange }) => {
  const handleChange = useCallback(
    (index: number, update: Partial<MemberFormFields>) =>
      onChange(
        (value ?? []).map((member, i) =>
          i === index ? { ...member, ...update } : member
        )
      ),
    [value, onChange]
  )

  const handleAdd = useCallback(
    (data: MemberFormFields) => onChange([...(value ?? []), data]),
    [onChange, value]
  )

  return (
    <div className='space-y-2'>
      {(value ?? []).map((member, i) => (
        <div key={member.personId} className='flex space-x-1'>
          <div className='flex-1'>
            <PersonSelect
              personId={member.personId}
              onChange={(id) => handleChange(i, { personId: id })}
            />
          </div>
          <Input
            className='flex-1'
            placeholder='Name'
            value={member.name ?? ''}
            onChange={(name) => handleChange(i, { name: name || undefined })}
          />
        </div>
      ))}

      <div className='flex space-x-1'>
        <div className='flex-1'>
          <PersonSelect onChange={(id) => handleAdd({ personId: id })} />
        </div>
        <Input
          className='flex-1'
          placeholder='Name'
          onChange={(name) => handleAdd({ name: name || undefined })}
        />
      </div>
    </div>
  )
}

const PersonSelect: FC<
  Omit<SelectProps, 'value' | 'options' | 'onChange'> & {
    personId?: number
    onChange: (id?: number) => void
  }
> = ({ personId, onChange, ...props }) => {
  const peopleQuery = usePeopleQuery()

  const options = useMemo(
    () => [
      { key: -1, label: 'None', data: { id: undefined } },
      ...(peopleQuery.data?.map((person) => ({
        key: person.id,
        label: toPersonNameString(person),
        data: person,
      })) ?? []),
    ],
    [peopleQuery.data]
  )

  const value = useMemo(
    () => options.find((option) => option.data.id === personId),
    [personId, options]
  )

  return (
    <Select
      value={value}
      options={options}
      onChange={(value) => onChange(value.data.id)}
      {...props}
    />
  )
}

export default CreateArtist

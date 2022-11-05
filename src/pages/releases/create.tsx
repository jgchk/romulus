import { useRouter } from 'next/router'
import {
  FC,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiDeleteBinLine } from 'react-icons/ri'

import Button from '../../components/common/Button'
import IconButton from '../../components/common/IconButton'
import Input from '../../components/common/Input'
import InputGroup from '../../components/common/InputGroup'
import Label from '../../components/common/Label'
import Select, { SelectProps } from '../../components/common/Select'
import { useReleaseTypesQuery } from '../../services/release-types'
import { useAddReleaseMutation } from '../../services/releases'
import { remove } from '../../utils/array'

type CreateReleaseFormFields = {
  title: string
  typeId?: number
  tracks: { displayNum?: string; title: string }[]
}

const getDefaultTrack = () => ({ displayNum: undefined, title: '' })

const CreateRelease: FC = () => {
  // TODO: navigate to people index & show error notification when no EDIT_RELEASE permission
  const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setFocus,
    setError,
    getValues,
    setValue,
  } = useForm<CreateReleaseFormFields>({
    defaultValues: { title: '', tracks: [getDefaultTrack()] },
  })

  const { mutate, isLoading } = useAddReleaseMutation()
  const onSubmit = useCallback(
    (data: CreateReleaseFormFields) => {
      if (data.typeId === undefined) {
        return setError('typeId', {
          type: 'required',
          message: 'Release Type is required',
        })
      }

      const processedData = {
        title: data.title,
        typeId: data.typeId,
        tracks: data.tracks,
      }

      return mutate(processedData, {
        onSuccess: (data) => {
          toast.success(`Created release '${data.title}'`)
          void router.push({
            pathname: '/releases/[id]',
            query: { id: data.id.toString() },
          })
        },
      })
    },
    [mutate, router, setError]
  )

  useEffect(() => setFocus('title'), [setFocus])

  const handleRemoveTrack = useCallback(
    (i: number) => setValue('tracks', remove([...getValues('tracks')], i)),
    [getValues, setValue]
  )

  const handleAddTrack = useCallback(
    () => setValue('tracks', [...getValues('tracks'), getDefaultTrack()]),
    [getValues, setValue]
  )

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

      <InputGroup id='type' label='Type' error={errors.typeId} required>
        <Controller
          name='typeId'
          control={control}
          rules={{ required: 'Type is required' }}
          render={({ field }) => <ReleaseTypeSelect {...field} />}
        />
      </InputGroup>

      <Label>Tracks</Label>
      <div className='space-y-1.5'>
        {watch('tracks').map((_, i) => (
          <div key={i} className='flex space-x-1'>
            <Controller
              name={`tracks.${i}.displayNum`}
              control={control}
              render={({ field }) => (
                <Input
                  className='w-20'
                  placeholder={(i + 1).toString()}
                  {...field}
                />
              )}
            />
            <Controller
              name={`tracks.${i}.title`}
              control={control}
              render={({ field }) => (
                <Input className='flex-1' placeholder='Title' {...field} />
              )}
            />
            <IconButton type='button' onClick={() => handleRemoveTrack(i)}>
              <RiDeleteBinLine />
            </IconButton>
          </div>
        ))}
        <Button type='button' onClick={() => handleAddTrack()}>
          Add Track
        </Button>
      </div>

      <Button type='submit' loading={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}

const ReleaseTypeSelect = forwardRef(
  (
    {
      typeId,
      onChange,
      ...props
    }: Omit<SelectProps, 'value' | 'options' | 'onChange'> & {
      typeId?: number
      onChange: (id?: number) => void
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const releaseTypesQuery = useReleaseTypesQuery()

    const options = useMemo(
      () =>
        releaseTypesQuery.data?.map((releaseType) => ({
          key: releaseType.id,
          label: releaseType.name,
          data: releaseType,
        })) ?? [],
      [releaseTypesQuery.data]
    )

    const value = useMemo(
      () =>
        typeId !== undefined
          ? options.find((option) => option.data.id === typeId)
          : undefined,
      [options, typeId]
    )

    return (
      <Select
        value={value}
        options={options}
        onChange={(value) => onChange(value.data.id)}
        ref={ref}
        {...props}
      />
    )
  }
)
ReleaseTypeSelect.displayName = 'ReleaseTypeSelect'

export default CreateRelease

import { useRouter } from 'next/router'
import { FC, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { CreateReleaseTypeInput } from '../../server/db/release-type/inputs'
import {
  useAddReleaseTypeMutation,
  useFieldTypesQuery,
} from '../../services/release-types'
import { isNonEmpty } from '../../utils/array'
import Button from '../common/Button'
import Checkbox from '../common/Checkbox'
import Input from '../common/Input'
import InputGroup from '../common/InputGroup'
import MediaTypeMultiselect from '../common/MediaTypesMultiselect'
import Select from '../common/Select'
import { SchemaField, SchemaObject, useSchemaStore } from './state'

type Errors = {
  mediaTypes?: string
  objectName?: string
}

const CreateReleaseType: FC = () => {
  // TODO: navigate to people index & show error notification when no EDIT_RELEASE_TYPE permission
  const router = useRouter()

  const [errors, setErrors] = useState<Errors>({})

  const { mutate, isLoading } = useAddReleaseTypeMutation()
  const onSubmit = useCallback(() => {
    const data = useSchemaStore.getState()

    if (!isNonEmpty(data.mediaTypes)) {
      return setErrors({ mediaTypes: 'Must select at least one media type' })
    }

    if (data.object.name.length === 0) {
      return setErrors({ objectName: 'Name is required' })
    }

    setErrors({})

    const processedData: CreateReleaseTypeInput = {
      mediaTypes: data.mediaTypes,
      schema: {
        name: data.object.name,
        fields: Object.values(data.fields).map((field) => ({
          name: field.name,
          type: field.type,
          array: field.array,
          nullable: field.nullable,
        })),
      },
    }
    return mutate(processedData, {
      onSuccess: () => {
        toast.success(`Created release type '${processedData.schema.name}'`)
        void router.push({ pathname: '/release-types' })
      },
    })
  }, [mutate, router])

  const mediaTypes = useSchemaStore((state) => state.mediaTypes)
  const setMediaTypes = useSchemaStore((state) => state.setMediaTypes)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <InputGroup
        id='media-types'
        label='Media Types'
        required
        error={errors.mediaTypes}
      >
        <MediaTypeMultiselect
          selectedIds={mediaTypes}
          onChange={setMediaTypes}
        />
      </InputGroup>

      <ObjectNode />

      <Button type='submit' loading={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}

const ObjectNode: FC = () => {
  const object = useSchemaStore((state) => state.object)
  const setObject = useSchemaStore((state) => state.setObject)

  const fieldIds = useSchemaStore((state) =>
    Object.values(state.fields).map((field) => field.id)
  )
  const addField = useSchemaStore((state) => state.addField)

  const handleChange = useCallback(
    (update: Partial<SchemaObject>) => setObject({ ...object, ...update }),
    [object, setObject]
  )

  return (
    <div className='border p-2'>
      <label>Name</label>
      <Input value={object.name} onChange={(name) => handleChange({ name })} />

      <label>Fields</label>
      {fieldIds.map((id) => (
        <FieldNode key={id} id={id} />
      ))}
      <Button type='button' onClick={() => addField()}>
        Add Field
      </Button>
    </div>
  )
}

const FieldNode: FC<{ id: number }> = ({ id }) => {
  const field = useSchemaStore((state) => state.fields[id])
  const setField = useSchemaStore((state) => state.setField)

  const handleChange = useCallback(
    (update: Partial<SchemaField>) => setField({ ...field, ...update }),
    [field, setField]
  )

  return (
    <div className='border p-1'>
      <label>Name</label>
      <Input value={field.name} onChange={(name) => handleChange({ name })} />

      <label>Type</label>
      <FieldTypeSelect
        value={field.type}
        onChange={(type) => handleChange({ type })}
      />

      <label>Array</label>
      <Checkbox
        value={field.array}
        onChange={(array) => handleChange({ array })}
        disabled={field.nullable}
      />

      <label>Nullable</label>
      <Checkbox
        value={field.nullable}
        onChange={(nullable) => handleChange({ nullable })}
        disabled={field.array}
      />
    </div>
  )
}

const FieldTypeSelect: FC<{
  value?: number
  onChange: (value: number) => void
}> = ({ value, onChange }) => {
  const fieldTypesQuery = useFieldTypesQuery()

  const fieldTypeOptions: {
    id: number
    label: string
    value: number
  }[] = useMemo(
    () =>
      fieldTypesQuery.data?.map(({ id, name }) => ({
        id,
        label: name,
        value: id,
      })) ?? [],
    [fieldTypesQuery.data]
  )

  const selectedOption = useMemo(
    () => fieldTypeOptions.find((option) => option.value === value),
    [fieldTypeOptions, value]
  )

  return (
    <Select
      value={selectedOption}
      options={fieldTypeOptions}
      onChange={(option) => onChange(option.value)}
    />
  )
}

export default CreateReleaseType

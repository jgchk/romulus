import { FC, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import create from 'zustand'

import Button from '../../components/common/Button'
import Checkbox from '../../components/common/Checkbox'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { useAddSchemaMutation } from '../../services/schema'

let currId = 0
const getId = () => currId++

type SchemaStore = {
  objects: Record<SchemaObjectId, SchemaObject>
  addObject: () => void
  setObject: (object: SchemaObject) => void

  fields: Record<SchemaFieldId, SchemaField>
  addField: (objectId: SchemaObjectId) => void
  setField: (field: SchemaField) => void
}

const useSchemaStore = create<SchemaStore>()((set) => ({
  objects: {},
  addObject: () => {
    const id = getId()
    return set((state) => ({
      ...state,
      objects: {
        ...state.objects,
        [id]: { _type: 'object', id, name: '', fields: [] },
      },
    }))
  },
  setObject: (object) =>
    set((state) => ({
      ...state,
      objects: { ...state.objects, [object.id]: object },
    })),

  fields: {},
  addField: (objectId) => {
    const fieldId = getId()
    return set((state) => ({
      ...state,
      fields: {
        ...state.fields,
        [fieldId]: {
          _type: 'field',
          id: fieldId,
          name: '',
          type: 0,
          array: false,
          nullable: false,
        },
      },
      objects: {
        ...state.objects,
        [objectId]: {
          ...state.objects[objectId],
          fields: [...state.objects[objectId].fields, fieldId],
        },
      },
    }))
  },
  setField: (field) =>
    set((state) => ({
      ...state,
      fields: { ...state.fields, [field.id]: field },
    })),
}))

type SchemaObjectId = number
type SchemaObject = {
  _type: 'object'
  id: SchemaObjectId
  name: string
  fields: SchemaFieldId[]
}

type SchemaFieldId = number
type SchemaField = {
  _type: 'field'
  id: SchemaFieldId
  name: string
  type: number | SchemaObjectId
  array: boolean
  nullable: boolean
}

const SchemaBuilder: FC = () => {
  const objects = useSchemaStore((state) => Object.values(state.objects))
  const fields = useSchemaStore((state) => state.fields)
  const addObject = useSchemaStore((state) => state.addObject)

  const { mutate, isLoading } = useAddSchemaMutation()
  const handleCreate = useCallback(() => {
    const apiData = objects.map((object) => ({
      ...object,
      fields: object.fields.map((id) => fields[id]),
    }))

    mutate(
      { objects: apiData },
      {
        onSuccess: () => {
          toast.success('Created schema!')
        },
      }
    )
  }, [fields, mutate, objects])

  return (
    <div>
      <Button onClick={handleCreate}>Create</Button>
      {isLoading && <div>Loading...</div>}
      <Button onClick={() => addObject()}>Add Object</Button>

      {objects.map((object) => (
        <ObjectNode key={object.id} id={object.id} />
      ))}
    </div>
  )
}

const ObjectNode: FC<{
  id: SchemaObjectId
}> = ({ id }) => {
  const object = useSchemaStore((state) => state.objects[id])
  const setObject = useSchemaStore((state) => state.setObject)
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
      {object.fields.map((id) => (
        <FieldNode key={id} id={id} />
      ))}
      <Button onClick={() => addField(id)}>Add Field</Button>
    </div>
  )
}

const FieldNode: FC<{ id: SchemaFieldId }> = ({ id }) => {
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
  value?: number | SchemaObjectId
  onChange: (value: number | SchemaObjectId) => void
}> = ({ value, onChange }) => {
  const objects = useSchemaStore((state) => Object.values(state.objects))

  const fieldTypeOptions: {
    id: number
    label: string
    value: number
  }[] = useMemo(
    () => [
      { id: 0, label: 'String', value: 0 },
      { id: 1, label: 'Integer', value: 1 },
      { id: 2, label: 'Decimal', value: 2 },
    ],
    []
  )

  const objectOptions: {
    id: number
    label: string
    value: SchemaObjectId
  }[] = useMemo(
    () =>
      objects.map((object) => ({
        id: object.id,
        label: object.name || `Unnamed Object ${object.id}`,
        value: object.id,
      })),
    [objects]
  )

  const options: {
    id: number
    label: string
    value: number | SchemaObjectId
  }[] = useMemo(
    () => [...fieldTypeOptions, ...objectOptions],
    [fieldTypeOptions, objectOptions]
  )

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  return (
    <Select
      value={selectedOption}
      options={options}
      onChange={(option) => onChange(option.value)}
    />
  )
}

export default SchemaBuilder

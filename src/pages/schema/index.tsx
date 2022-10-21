import { FC, useCallback, useMemo } from 'react'
import create from 'zustand'

import Button from '../../components/common/Button'
import Checkbox from '../../components/common/Checkbox'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'

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
          type: 'string',
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
  type: FieldType | SchemaObjectId
  array: boolean
  nullable: boolean
}

type FieldType = 'string' | 'number'

const SchemaBuilder: FC = () => {
  const objects = useSchemaStore((state) => Object.values(state.objects))
  const addObject = useSchemaStore((state) => state.addObject)

  return (
    <div>
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
  value?: FieldType | SchemaObjectId
  onChange: (value: FieldType | SchemaObjectId) => void
}> = ({ value, onChange }) => {
  const objects = useSchemaStore((state) => Object.values(state.objects))

  const fieldTypeOptions: {
    id: string
    label: string
    value: FieldType
  }[] = useMemo(
    () => [
      { id: 'string', label: 'String', value: 'string' },
      { id: 'number', label: 'Number', value: 'number' },
    ],
    []
  )

  const objectOptions: {
    id: string
    label: string
    value: SchemaObjectId
  }[] = useMemo(
    () =>
      objects.map((object) => ({
        id: object.id.toString(),
        label: object.name || `Unnamed Object ${object.id}`,
        value: object.id,
      })),
    [objects]
  )

  const options: {
    id: string
    label: string
    value: FieldType | SchemaObjectId
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

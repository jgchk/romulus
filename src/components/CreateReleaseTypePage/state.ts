import create from 'zustand'

import { uniqueId } from '../../utils/misc'

type FormStore = {
  object: SchemaObject
  setObject: (object: SchemaObject) => void

  fields: Record<number, SchemaField>
  addField: () => void
  setField: (field: SchemaField) => void
}

export type SchemaObject = {
  _type: 'object'
  id: number
  name: string
}

export type SchemaField = {
  _type: 'field'
  id: number
  name: string
  type: number
  array: boolean
  nullable: boolean
}

export const useSchemaStore = create<FormStore>()((set) => ({
  object: { _type: 'object', id: uniqueId(), name: '', fields: [] },
  setObject: (object) => set((state) => ({ ...state, object })),

  fields: {},
  addField: () => {
    const fieldId = uniqueId()
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
    }))
  },
  setField: (field) =>
    set((state) => ({
      ...state,
      fields: { ...state.fields, [field.id]: field },
    })),
}))

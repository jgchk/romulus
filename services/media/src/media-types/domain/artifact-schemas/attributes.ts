export type AttributeSchema =
  | StringAttributeSchema
  | NumberAttributeSchema
  | DateAttributeSchema
  | DurationAttributeSchema

type StringAttributeSchema = {
  id: string
  name: string
  type: 'string'
}

type NumberAttributeSchema = {
  id: string
  name: string
  type: 'number'
}

type DateAttributeSchema = {
  id: string
  name: string
  type: 'date'
}

type DurationAttributeSchema = {
  id: string
  name: string
  type: 'duration'
}

export type AttributeSchema = {
  id: string
  name: string
  type: AttributeType
}

export type AttributeType = 'string' | 'number' | 'date' | 'duration'

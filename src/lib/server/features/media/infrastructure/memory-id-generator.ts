import type { IIdGenerator } from '../domain/ids/id-generator'

export class MemoryIdGenerator implements IIdGenerator {
  private id: number

  constructor() {
    this.id = 0
  }

  generate() {
    const currentId = this.id
    const nextId = currentId + 1
    this.id = nextId
    return nextId
  }
}

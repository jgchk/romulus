import { intersection } from 'ramda'

import { DerivedChildError } from './errors/derived-child'
import { DerivedInfluenceError } from './errors/derived-influence'
import { SelfInfluenceError } from './errors/self-influence'

export class GenreTreeNode {
  private constructor(
    public id: number,
    public name: string,
    public parents: Set<number>,
    public derivedFrom: Set<number>,
    public influences: Set<number>,
  ) {}

  static create(
    id: number,
    name: string,
    parents: Set<number>,
    derivedFrom: Set<number>,
    influences: Set<number>,
  ): GenreTreeNode | DerivedChildError | DerivedInfluenceError | SelfInfluenceError {
    const isDerivedAndChild = intersection([...parents], [...derivedFrom]).length > 0
    if (isDerivedAndChild) {
      return new DerivedChildError(id)
    }

    const isDerivedAndInfluence = intersection([...derivedFrom], [...influences]).length > 0
    if (isDerivedAndInfluence) {
      return new DerivedInfluenceError(id)
    }

    const influencesSelf = influences.has(id)
    if (influencesSelf) {
      return new SelfInfluenceError()
    }

    return new GenreTreeNode(id, name, parents, derivedFrom, influences)
  }
}

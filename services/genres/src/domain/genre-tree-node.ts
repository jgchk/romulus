import { err, ok, type Result } from 'neverthrow'
import { intersection } from 'ramda'

import { DerivedChildError } from './errors/derived-child.js'
import { DerivedInfluenceError } from './errors/derived-influence.js'
import { SelfInfluenceError } from './errors/self-influence.js'

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
  ): Result<GenreTreeNode, DerivedChildError | DerivedInfluenceError | SelfInfluenceError> {
    const isDerivedAndChild = intersection([...parents], [...derivedFrom]).length > 0
    if (isDerivedAndChild) {
      return err(new DerivedChildError(id))
    }

    const isDerivedAndInfluence = intersection([...derivedFrom], [...influences]).length > 0
    if (isDerivedAndInfluence) {
      return err(new DerivedInfluenceError(id))
    }

    const influencesSelf = influences.has(id)
    if (influencesSelf) {
      return err(new SelfInfluenceError())
    }

    return ok(new GenreTreeNode(id, name, parents, derivedFrom, influences))
  }
}

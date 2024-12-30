import { CustomError } from '../../../shared/domain/errors'

export class MediaArtifactSchemaNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaArtifactSchemaNotFoundError', `Media artifact schema with id "${id}" not found`)
  }
}

export class MediaArtifactRelationSchemaNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super(
      'MediaArtifactRelationSchemaNotFoundError',
      `Media artifact relation schema with id "${id}" not found`,
    )
  }
}

export class MediaArtifactNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaArtifactNotFoundError', `Media artifact with id "${id}" not found`)
  }
}

export class InvalidRelationError extends CustomError {
  constructor(
    public readonly requiredRelation: {
      sourceSchema: string
      targetSchema: string
    },
    public readonly actualRelation: {
      sourceSchema: string
      targetSchema: string
    },
  ) {
    super(
      'InvalidRelationError',
      `Invalid relation. The relation schema maps ${requiredRelation.sourceSchema} to ${requiredRelation.targetSchema}, but the provided relation maps ${actualRelation.sourceSchema} to ${actualRelation.targetSchema}`,
    )
  }
}

export class MissingAttributeError extends CustomError {
  constructor(public readonly id: string) {
    super('MissingAttributeError', `Attribute with id "${id}" is missing`)
  }
}

export class IncorrectAttributeTypeError extends CustomError {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly value: unknown,
  ) {
    super(
      'IncorrectAttributeTypeError',
      `Attribute with id "${id}" should be of type ${type}, but got ${JSON.stringify(value)}`,
    )
  }
}

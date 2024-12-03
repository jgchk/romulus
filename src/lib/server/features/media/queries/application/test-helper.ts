import { expect } from 'vitest'

import {
  AddMediaTypeCommand,
  AddMediaTypeCommandHandler,
} from '../../commands/application/add-media-type'
import {
  AddParentToMediaTypeCommand,
  AddParentToMediaTypeCommandHandler,
} from '../../commands/application/add-parent-to-media-type'
import { CopyTreeCommand, CopyTreeCommandHandler } from '../../commands/application/copy-tree'
import { CreateTreeCommand, CreateTreeCommandHandler } from '../../commands/application/create-tree'
import { MergeTreesCommand, MergeTreesCommandHandler } from '../../commands/application/merge-trees'
import {
  RemoveMediaTypeCommand,
  RemoveMediaTypeCommandHandler,
} from '../../commands/application/remove-media-type'
import {
  RequestMergeTreesCommand,
  RequestMergeTreesCommandHandler,
} from '../../commands/application/request-merge'
import {
  SetMainTreeCommand,
  SetMainTreeCommandHandler,
} from '../../commands/application/set-main-tree'
import { MemoryTreeRepository as CommandMemoryTreeRepository } from '../../commands/infrastructure/memory-tree-repository'
import type { MediaTypeTreeEvent } from '../../shared/domain/events'
import { MemoryEventStore } from '../../shared/infrastructure/memory-event-store'
import { MemoryTreeRepository as QueryMemoryTreeRepository } from '../infrastructure/memory-tree-repository'
import { GetMediaTypeTreeQuery, GetMediaTypeTreeQueryHandler } from './get-media-type-tree'

export class TestHelper {
  private store = new MemoryEventStore<MediaTypeTreeEvent>()
  commandRepo = new CommandMemoryTreeRepository(this.store)
  queryRepo = new QueryMemoryTreeRepository(this.store)

  async given(commands: Command[]): Promise<void> {
    for (const command of commands) {
      const error = await this.executeCommand(command)
      if (error instanceof Error) {
        expect.fail(`Failed to execute command ${JSON.stringify(command)}: ${error.message}`)
      }
    }
  }

  async when<Q extends Query>(query: Q) {
    const error = await this.executeQuery(query)
    return error
  }

  private executeCommand(command: Command): Promise<void | Error> {
    if (command instanceof CreateTreeCommand) {
      return new CreateTreeCommandHandler(this.commandRepo).handle(command)
    } else if (command instanceof AddMediaTypeCommand) {
      return new AddMediaTypeCommandHandler(this.commandRepo).handle(command)
    } else if (command instanceof AddParentToMediaTypeCommand) {
      return new AddParentToMediaTypeCommandHandler(this.commandRepo).handle(command)
    } else if (command instanceof CopyTreeCommand) {
      return new CopyTreeCommandHandler(this.commandRepo).handle(command)
    } else if (command instanceof RequestMergeTreesCommand) {
      return new RequestMergeTreesCommandHandler(this.commandRepo).handle(command)
    } else if (command instanceof MergeTreesCommand) {
      return new MergeTreesCommandHandler(this.commandRepo).handle(command)
    } else if (command instanceof RemoveMediaTypeCommand) {
      return new RemoveMediaTypeCommandHandler(this.commandRepo).handle(command)
    } else if (command instanceof SetMainTreeCommand) {
      return new SetMainTreeCommandHandler(this.commandRepo).handle(command)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = command
      return Promise.resolve()
    }
  }

  /* eslint-disable returned-errors/enforce-error-handling */
  private executeQuery<Q extends Query>(query: Q) {
    if (query instanceof GetMediaTypeTreeQuery) {
      return new GetMediaTypeTreeQueryHandler(this.queryRepo).handle(query)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = query
    }
  }
  /* eslint-enabled returned-errors/enforce-error-handling */
}

export type Command =
  | CreateTreeCommand
  | AddMediaTypeCommand
  | AddParentToMediaTypeCommand
  | CopyTreeCommand
  | RequestMergeTreesCommand
  | MergeTreesCommand
  | RemoveMediaTypeCommand
  | SetMainTreeCommand

export type Query = GetMediaTypeTreeQuery

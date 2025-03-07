import { expect } from 'vitest'

import { MemoryEventStore } from '../../shared/infrastructure/memory-event-store.js'
import { MemoryTreeRepository } from '../infrastructure/memory-tree-repository.js'
import { AddMediaTypeCommand, AddMediaTypeCommandHandler } from './add-media-type.js'
import {
  AddParentToMediaTypeCommand,
  AddParentToMediaTypeCommandHandler,
} from './add-parent-to-media-type.js'
import { CopyTreeCommand, CopyTreeCommandHandler } from './copy-tree.js'
import { CreateTreeCommand, CreateTreeCommandHandler } from './create-tree.js'
import { MergeTreesCommand, MergeTreesCommandHandler } from './merge-trees.js'
import { RemoveMediaTypeCommand, RemoveMediaTypeCommandHandler } from './remove-media-type.js'
import { RequestMergeTreesCommand, RequestMergeTreesCommandHandler } from './request-merge.js'
import { SetMainTreeCommand, SetMainTreeCommandHandler } from './set-main-tree.js'

export class TestHelper {
  treeRepo: MemoryTreeRepository = new MemoryTreeRepository(new MemoryEventStore())

  async given(commands: Command[]): Promise<void> {
    for (const command of commands) {
      const error = await this.executeCommand(command)
      if (error instanceof Error) {
        expect.fail(`Failed to execute command ${JSON.stringify(command)}: ${error.message}`)
      }
    }
  }

  async when(command: Command): Promise<void | Error> {
    const error = await this.executeCommand(command)
    return error
  }

  private executeCommand(command: Command): Promise<void | Error> {
    if (command instanceof CreateTreeCommand) {
      return new CreateTreeCommandHandler(this.treeRepo).handle(command)
    } else if (command instanceof AddMediaTypeCommand) {
      return new AddMediaTypeCommandHandler(this.treeRepo).handle(command)
    } else if (command instanceof AddParentToMediaTypeCommand) {
      return new AddParentToMediaTypeCommandHandler(this.treeRepo).handle(command)
    } else if (command instanceof CopyTreeCommand) {
      return new CopyTreeCommandHandler(this.treeRepo).handle(command)
    } else if (command instanceof RequestMergeTreesCommand) {
      return new RequestMergeTreesCommandHandler(this.treeRepo).handle(command)
    } else if (command instanceof MergeTreesCommand) {
      return new MergeTreesCommandHandler(this.treeRepo).handle(command)
    } else if (command instanceof RemoveMediaTypeCommand) {
      return new RemoveMediaTypeCommandHandler(this.treeRepo).handle(command)
    } else if (command instanceof SetMainTreeCommand) {
      return new SetMainTreeCommandHandler(this.treeRepo).handle(command)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = command
      return Promise.resolve()
    }
  }
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

import { getByRole, getByTestId, queryByRole, render } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'svelte'
import { readable, writable } from 'svelte/store'
import { expect } from 'vitest'

import { USER_CONTEXT_KEY } from '$lib/contexts/user'
import { USER_SETTINGS_CONTEXT_KEY } from '$lib/contexts/user-settings'
import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'
import { withProps } from '$lib/utils/object'

import { createTreeStateStore, TREE_STATE_STORE_KEY } from '../../tree-state-store.svelte'
import GenreTree from './GenreTree.svelte'

export function setup(
  props: ComponentProps<typeof GenreTree>,
  context: {
    user?: App.Locals['user']
    userSettings?: Partial<UserSettings>
  } = {},
) {
  const user = userEvent.setup()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const renderedComponent = renderComponent({ ...props, virtual: props.virtual ?? false }, context)
  const componentModel = createComponentModel(renderedComponent)

  return {
    user,
    ...renderedComponent,
    ...componentModel,
  }
}

function renderComponent(
  props: ComponentProps<typeof GenreTree>,
  context: {
    user?: App.Locals['user']
    userSettings?: Partial<UserSettings>
  } = {},
) {
  return render(GenreTree, {
    props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: new Map<any, any>([
      [USER_CONTEXT_KEY, readable(context.user)],
      [
        USER_SETTINGS_CONTEXT_KEY,
        writable<UserSettings>({ ...DEFAULT_USER_SETTINGS, ...context.userSettings }),
      ],
      [TREE_STATE_STORE_KEY, createTreeStateStore()],
    ]),
  })
}

function createComponentModel(renderedComponent: ReturnType<typeof renderComponent>) {
  const emptyState = {
    get: () => renderedComponent.getByText('No genres found.'),
    query: () => renderedComponent.queryByText('No genres found.'),
  }

  const createGenreLink = {
    get: () => renderedComponent.getByRole('link', { name: 'Create one.' }),
    query: () => renderedComponent.queryByRole('link', { name: 'Create one.' }),
  }

  const genreNode = {
    get: (index = 0) => {
      const nodes = renderedComponent
        .getByLabelText('Genre Tree')
        .querySelectorAll('.genre-tree-node')
      const node = nodes[index]

      if (!node) {
        expect.fail(`Expected a genre tree node to exist at index ${index}`)
      }
      if (!(node instanceof HTMLElement)) {
        expect.fail(`Expected genre tree node to be an HTMLElement at index ${index}`)
      }

      return createGenreNodeComponentModel(node)
    },
    query: (index = 0) => {
      const nodes = renderedComponent
        .getByLabelText('Genre Tree')
        .querySelectorAll('.genre-tree-node')
      const node = nodes[index]

      if (!node) {
        return null
      }
      if (!(node instanceof HTMLElement)) {
        expect.fail(`Expected genre tree node to be an HTMLElement at index ${index}`)
      }

      return createGenreNodeComponentModel(node)
    },
  }

  const derivedGenresNode = {
    get: (index = 0) => {
      const nodes = renderedComponent.getAllByTestId('derived-genres')
      const node = nodes[index]

      if (!node) {
        expect.fail(`Expected a derived genres node to exist at index ${index}`)
      }
      if (!(node instanceof HTMLElement)) {
        expect.fail(`Expected a derived genres node to be an HTMLElement at index ${index}`)
      }

      return withProps(node, {
        expandButton: {
          get: () => getByRole(node, 'button', { name: 'Expand' }),
          query: () => queryByRole(node, 'button', { name: 'Expand' }),
        },
        name: {
          get: () => getByTestId(node, 'derived-genres-name'),
        },
      })
    },
  }

  const collapseAllButton = {
    get: () => renderedComponent.getByRole('button', { name: 'Collapse All' }),
    query: () => renderedComponent.queryByRole('button', { name: 'Collapse All' }),
  }

  return { emptyState, createGenreLink, genreNode, derivedGenresNode, collapseAllButton }
}

function createGenreNodeComponentModel(node: HTMLElement) {
  return withProps(node, {
    expandButton: {
      get: () => getByRole(node, 'button', { name: 'Expand' }),
      query: () => queryByRole(node, 'button', { name: 'Expand' }),
    },
    link: {
      get: () => getByRole(node, 'link'),
    },
  })
}

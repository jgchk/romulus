import { flip, offset, size } from '@floating-ui/dom'
import { getContext, setContext } from 'svelte'

import { createPopoverActions } from '$lib/actions/popover'
import { type Action } from '$lib/actions/types'
import { type ReadableBox, type WritableBox } from '$lib/runes/box.svelte'

export class SelectState {
  uuid: string

  value: WritableBox<string | undefined>
  options: ReadableBox<string[]>
  disabled: ReadableBox<boolean>

  open = $state<boolean>(false)
  focusedValue = $state<string | undefined>(undefined)
  filter = $state('')

  triggerRef = $state<HTMLElement | null>(null)
  inputRef = $state<HTMLInputElement | null>(null)
  optionsRef = $state<HTMLElement | null>(null)

  readonly popoverReference: Action
  readonly popoverElement: Action

  constructor({
    value,
    options,
    disabled,
  }: {
    value: WritableBox<string | undefined>
    options: ReadableBox<string[]>
    disabled: ReadableBox<boolean>
  }) {
    this.uuid = crypto.randomUUID()

    this.value = value
    this.options = options
    this.disabled = disabled

    const [popoverReference, popoverElement] = createPopoverActions({
      middleware: [
        offset(4),
        flip(),
        size({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              minWidth: `${rects.reference.width}px`,
            })
          },
        }),
      ],
    })
    this.popoverReference = popoverReference
    this.popoverElement = popoverElement

    $effect(() => {
      if (this.focusedValue === undefined) {
        this.focusedValue = this.options.current[0]
      } else {
        const focusedValueIndex = this.options.current.indexOf(this.focusedValue)
        if (focusedValueIndex === -1) {
          this.focusedValue = this.options.current[0]
        }
      }
    })
  }

  get optionsClassname() {
    return `select-${this.uuid}-options`
  }

  focusNextValue() {
    const focusedValue = this.focusedValue
    const currentIndex =
      focusedValue === undefined ? -1 : this.options.current.indexOf(focusedValue)
    const nextIndex = (currentIndex + 1) % this.options.current.length
    const nextOptionValue = this.options.current[nextIndex]
    this.focusedValue = nextOptionValue
  }

  focusPreviousValue() {
    const focusedValue = this.focusedValue
    const currentIndex =
      focusedValue === undefined
        ? this.options.current.length
        : this.options.current.indexOf(focusedValue)
    const previousIndex =
      (currentIndex - 1 + this.options.current.length) % this.options.current.length
    const previousOptionValue = this.options.current[previousIndex]
    this.focusedValue = previousOptionValue
  }

  close(refocus = true) {
    this.filter = ''
    this.open = false
    if (refocus) {
      this.triggerRef?.focus()
    }
  }
}

const SELECT_STATE_KEY = Symbol('select-state')

export function setSelectState(state: SelectState): void {
  setContext<SelectState>(SELECT_STATE_KEY, state)
}

export function getSelectState(): SelectState {
  const state = getContext<SelectState | undefined>(SELECT_STATE_KEY)
  if (state === undefined) {
    throw new Error('Could not find SelectState. Did you call setSelectState()?')
  }
  return state
}

export function createSelectHandleKeyDown(selectState: SelectState) {
  return function (event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter': {
        if (!selectState.open) {
          event.preventDefault()
          selectState.open = true
          return
        }

        event.preventDefault()
        selectState.value.current = selectState.focusedValue
        selectState.close()

        return
      }

      case 'ArrowDown': {
        event.preventDefault()

        if (!selectState.open) {
          selectState.open = true
          return
        }

        selectState.focusNextValue()
        return
      }

      case 'ArrowUp': {
        event.preventDefault()

        if (!selectState.open) {
          selectState.open = true
          return
        }

        selectState.focusPreviousValue()
        return
      }

      case 'Escape': {
        if (selectState.open) {
          event.preventDefault()
          event.stopPropagation()
          selectState.close()
        }
        return
      }
    }
  }
}

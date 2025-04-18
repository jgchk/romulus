import { flip, offset, size } from '@floating-ui/dom'
import { getContext, setContext } from 'svelte'

import { createPopoverActions } from '$lib/actions/popover'
import type { Action } from '$lib/actions/types'
import type { ReadableBox, WritableBox } from '$lib/runes/box.svelte'

export class MultiselectState {
  uuid: string

  value: WritableBox<string[]>
  options: ReadableBox<string[]>
  disabled: ReadableBox<boolean>

  open = $state<boolean>(false)
  focusedValue = $state<string | undefined>(undefined)
  filter = $state('')

  inputRef = $state<HTMLInputElement | null>(null)
  optionsRef = $state<HTMLElement | null>(null)

  readonly popoverReference: Action
  readonly popoverElement: Action

  constructor({
    value,
    options,
    disabled,
  }: {
    value: WritableBox<string[]>
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

  selectValue(value: string) {
    this.value.current = [...this.value.current.filter((v) => v !== value), value]
  }

  deselectValue(value: string) {
    this.value.current = this.value.current.filter((v) => v !== value)
  }

  deselectLastValue() {
    this.value.current = this.value.current.slice(0, -1)
  }

  get optionsClassname() {
    return `multiselect-${this.uuid}-options`
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
}

const MULTISELECT_STATE_KEY = Symbol('multiselect-state')

export function setMultiselectState(state: MultiselectState): void {
  setContext<MultiselectState>(MULTISELECT_STATE_KEY, state)
}

export function getMultiselectState(): MultiselectState {
  const state = getContext<MultiselectState | undefined>(MULTISELECT_STATE_KEY)
  if (state === undefined) {
    throw new Error('Could not find MultiselectState. Did you call setMultiselectState()?')
  }
  return state
}

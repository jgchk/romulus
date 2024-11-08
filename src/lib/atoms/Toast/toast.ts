/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SvelteComponentTyped } from 'svelte'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

import type { AreAllPropsOptional } from '$lib/utils/types'

export const ToastDefaults = {
  duration: 4000,
} as const

export type ToastMsg = string | typeof SvelteComponentTyped<any, any, any>

export type Toast = {
  id: number
  msg: ToastMsg
  hide: () => void
} & ToastOptions

export type ToastOptions = {
  duration?: number
  variant?: ToastVariant
  props?: any
}

export type ToastVariant = 'info' | 'success' | 'error' | 'warning'

export type ToastStore = Writable<Toast[]> & {
  show: ShowFunc
  success: ShowFunc
  error: ShowFunc
  warning: ShowFunc
  hide: HideFunc
}
type ShowFunc = <T extends ToastMsg>(
  msg: T,
  ...params: T extends typeof SvelteComponentTyped<
    infer Props extends Record<string, any>,
    any,
    any
  >
    ? AreAllPropsOptional<
        Omit<Props, 'toast'>,
        [(ToastOptions & { props?: Omit<Props, 'toast'> })?],
        [ToastOptions & { props: Omit<Props, 'toast'> }]
      >
    : [ToastOptions?]
) => number
type HideFunc = (id: number) => void

const createToast = (): ToastStore => {
  let lastId = 0
  const store = writable<Toast[]>([])

  const show: ShowFunc = (msg, ...params) => {
    const id = lastId++
    const options = params[0]
    const toast: Toast = { id, msg, ...options, hide: () => hide(id) }
    store.update((toasts) => [...toasts, toast])
    return id
  }

  const success: ShowFunc = (msg, ...params) => {
    params[0] = { ...params[0], variant: 'success' }
    return show(msg, ...params)
  }
  const error: ShowFunc = (msg, ...params) => {
    params[0] = { ...params[0], variant: 'error' }
    return show(msg, ...params)
  }
  const warning: ShowFunc = (msg, ...params) => {
    params[0] = { ...params[0], variant: 'warning' }
    return show(msg, ...params)
  }

  const hide: HideFunc = (id) => {
    store.update((toasts) => toasts.filter((t) => t.id !== id))
  }

  return { ...store, show, success, error, warning, hide }
}

export const toast = createToast()

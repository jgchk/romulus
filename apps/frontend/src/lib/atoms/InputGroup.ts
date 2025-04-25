import { getContext, setContext } from 'svelte'
import { type Readable } from 'svelte/store'

export type InputGroupErrors = Readable<string[] | undefined>

const inputGroupContextKey = Symbol('input-group-context')

export const setInputGroupErrors = (errors: InputGroupErrors) =>
  setContext<InputGroupErrors>(inputGroupContextKey, errors)

export const getInputGroupErrors = (): InputGroupErrors | undefined =>
  getContext<InputGroupErrors>(inputGroupContextKey)

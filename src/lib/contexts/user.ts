import type { User } from 'lucia'
import { writable } from 'svelte/store'

export const user = writable<User | undefined>()

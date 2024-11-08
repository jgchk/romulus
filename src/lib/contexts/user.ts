import { getContext, setContext } from 'svelte'
import { type Readable } from 'svelte/store'

export type UserStore = Readable<App.Locals['user'] | undefined>

export const USER_CONTEXT_KEY = Symbol('user-context')

export const setUserContext = (value: UserStore) => setContext(USER_CONTEXT_KEY, value)

export const getUserContext = () => getContext<UserStore>(USER_CONTEXT_KEY)

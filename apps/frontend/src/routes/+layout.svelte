<script lang="ts">
  import '../app.css'

  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'
  import { writable } from 'svelte/store'

  import { browser } from '$app/environment'
  import Toaster from '$lib/atoms/Toast/Toaster.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import { setUserContext, type UserStore } from '$lib/contexts/user'
  import { setUserSettingsContext } from '$lib/contexts/user-settings'
  import UserSettingsStore from '$lib/contexts/user-settings/store'

  import type { LayoutData } from './$types'
  import DarkModeApplier from './DarkModeApplier.svelte'

  type Props = {
    data: LayoutData
    children?: import('svelte').Snippet
  }

  let { data, children }: Props = $props()

  const user: UserStore = writable(data.user)
  const userSettings = new UserSettingsStore(data.settings)

  setUserContext(user)
  setUserSettingsContext(userSettings)

  $user = data.user
  $effect(() => {
    $user = data.user
  })

  userSettings.updateUser(data.settings)
  $effect(() => {
    userSettings.updateUser(data.settings)
  })

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        experimental_prefetchInRender: true,
      },
    },
  })
</script>

<QueryClientProvider client={queryClient}>
  <DarkModeApplier />

  <div
    class="flex h-full w-full flex-col gap-1 bg-gray-200 p-2 text-black transition dark:bg-gray-800 dark:text-white"
  >
    <Navbar />
    <main class="flex-1 overflow-auto">
      {@render children?.()}
    </main>

    <Toaster class="pr-4 pt-4" />
  </div>
</QueryClientProvider>

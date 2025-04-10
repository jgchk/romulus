<script lang="ts">
  import '../app.css'

  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'
  import { writable } from 'svelte/store'

  import { browser } from '$app/environment'
  import Card from '$lib/atoms/Card.svelte'
  import Toaster from '$lib/atoms/Toast/Toaster.svelte'
  import { setUserContext, type UserStore } from '$lib/contexts/user'
  import { setUserSettingsContext } from '$lib/contexts/user-settings'
  import UserSettingsStore from '$lib/contexts/user-settings/store'
  import MediaTypeSidebar from '$lib/features/media/components/Sidebar.svelte'

  import type { LayoutData } from './$types'
  import AccountDropdown from './AccountDropdown.svelte'
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
    <nav class="flex justify-between">
      <Card
        class="flex p-1 text-sm font-bold tracking-wide text-gray-600 transition dark:text-gray-300"
      >
        <a
          href="/genres"
          class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
          >Tree</a
        >
        <a
          href="/genres/table"
          class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
          >Table</a
        >
        <a
          href="/genres/latest"
          class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
          >Latest</a
        >
        <a
          href="/genres/random"
          class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
          >Random</a
        >
      </Card>

      <Card
        class="flex gap-1 p-1 text-sm font-bold tracking-wide text-gray-600 transition dark:text-gray-300"
      >
        {#if data.user}
          <AccountDropdown account={data.user} />
        {:else}
          <a
            href="/sign-in"
            class="h-full rounded border border-transparent bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
            >Sign in</a
          >
          <a
            href="/sign-up"
            class="h-full rounded border border-gray-700 border-opacity-25 bg-gray-800 px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-700"
            >Sign up</a
          >
        {/if}
      </Card>
    </nav>
    <main class="flex flex-1 overflow-auto">
      {#if data.user?.permissions.mediaTypes.canCreate}
        <MediaTypeSidebar />
      {/if}

      <div class="flex-1">
        {@render children?.()}
      </div>
    </main>

    <Toaster class="pr-4 pt-4" />
  </div>
</QueryClientProvider>

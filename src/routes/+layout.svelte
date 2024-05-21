<script lang="ts">
  import '../app.css'

  import { onMount } from 'svelte'

  import Card from '$lib/atoms/Card.svelte'
  import Toaster from '$lib/atoms/Toast/Toaster.svelte'
  import { user } from '$lib/contexts/user'

  import type { LayoutData } from './$types'
  import AccountDropdown from './AccountDropdown.svelte'

  export let data: LayoutData

  $: $user = data.user

  // Used to indicate when hydration is complete for Playwright tests
  // See: https://github.com/microsoft/playwright/issues/19858#issuecomment-1377088645
  // and: https://spin.atomicobject.com/hydration-sveltekit-tests/
  onMount(() => {
    document.body.classList.add('started')
  })
</script>

<div class="flex h-full w-full flex-col gap-1 bg-gray-800 p-2 text-white">
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
    </Card>

    <Card
      class="flex p-1 text-sm font-bold tracking-wide text-gray-600 transition dark:text-gray-300"
    >
      {#if data.user}
        <AccountDropdown account={data.user} />
      {:else}
        <a
          href="/register"
          class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
          >Register</a
        >
        <a
          href="/sign-in"
          class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
          >Sign in</a
        >
      {/if}
    </Card>
  </nav>
  <main class="flex-1 overflow-auto">
    <slot />
  </main>

  <Toaster class="pr-4 pt-4" />
</div>

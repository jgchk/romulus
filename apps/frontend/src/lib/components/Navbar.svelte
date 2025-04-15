<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { routes } from '$lib/routes'

  import AccountDropdown from '../../routes/AccountDropdown.svelte'

  const user = getUserContext()
</script>

<nav class="flex justify-between">
  <Card
    class="flex p-1 text-sm font-bold tracking-wide text-gray-600 transition dark:text-gray-300"
  >
    <a
      href={routes.genres.route()}
      class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
      >Tree</a
    >
    <a
      href={routes.genres.table.route()}
      class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
      >Table</a
    >
    <a
      href={routes.genres.latest.route()}
      class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
      >Latest</a
    >
    <a
      href={routes.genres.random.route()}
      class="h-full rounded bg-transparent px-2.5 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
      >Random</a
    >
  </Card>

  <Card
    class="flex gap-1 p-1 text-sm font-bold tracking-wide text-gray-600 transition dark:text-gray-300"
  >
    {#if $user}
      <AccountDropdown account={$user} />
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

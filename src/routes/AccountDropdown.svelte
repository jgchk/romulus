<script lang="ts">
  import { offset } from '@floating-ui/dom'
  import type { User } from 'lucia'
  import { CaretDown, Key, MoonStars, SignOut, Sun, UserCircle } from 'phosphor-svelte'

  import { enhance } from '$app/forms'
  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import Card from '$lib/atoms/Card.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { slide } from '$lib/transitions/slide'
  import { cn } from '$lib/utils/dom'

  export let account: User

  let open = false

  const [popoverReference, popoverElement] = createPopoverActions({
    placement: 'bottom-end',
    middleware: [offset(4)],
  })

  const userSettings = getUserSettingsContext()
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === 'Escape') open = false
  }}
/>

<button
  use:popoverReference
  class="group/account-button h-full w-full"
  on:click={() => (open = !open)}
>
  <div
    class="flex h-full items-center gap-1 rounded px-2 pr-1 transition group-hover/account-button:bg-gray-200 dark:group-hover/account-button:bg-gray-800"
  >
    <div>{account.username}</div>
    <CaretDown
      size={12}
      weight="bold"
      class={cn('text-gray-500 transition-all dark:text-gray-400', open && 'rotate-180 transform')}
    />
  </div>
</button>

{#if open}
  <div
    class="relative z-10"
    transition:slide|local={{ axis: 'y' }}
    use:popoverElement
    use:clickOutside={() => (open = false)}
  >
    <Card class="overflow-hidden shadow">
      <a
        class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
        href="/accounts/{account.id}"
      >
        <UserCircle size={18} />
        Profile
      </a>

      <a
        class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
        href="/accounts/{account.id}/keys"
      >
        <Key size={18} />
        API Keys
      </a>

      <button
        class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
        on:click={() => {
          userSettings.update((prev) => ({ ...prev, darkMode: !$userSettings.darkMode }))
        }}
      >
        {#if $userSettings.darkMode}
          <MoonStars size={18} />
          Dark Mode
        {:else}
          <Sun size={18} />
          Light Mode
        {/if}
      </button>

      <form method="POST" action="/sign-out" use:enhance>
        <button
          class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
          type="submit"
        >
          <SignOut size={18} />
          Sign out
        </button>
      </form>
    </Card>
  </div>
{/if}

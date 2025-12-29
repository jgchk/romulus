<script lang="ts">
  import { offset } from '@floating-ui/dom'
  import { CaretDown, Key, MoonStars, SignOut, Sun, UserCircle, UsersThree } from 'phosphor-svelte'

  import { enhance } from '$app/forms'
  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import Card from '$lib/atoms/Card.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { slide } from '$lib/transitions/slide'
  import { cn } from '$lib/utils/dom'

  type Props = {
    account: { id: number; username: string }
  }

  let { account }: Props = $props()

  let open = $state(false)

  const [popoverReference, popoverElement] = createPopoverActions({
    placement: 'bottom-end',
    middleware: [offset(4)],
  })

  const user = getUserContext()
  const userSettings = getUserSettingsContext()
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') open = false
  }}
/>

<div use:clickOutside={() => (open = false)}>
  <button
    type="button"
    use:popoverReference
    class="group/account-button h-full w-full"
    onclick={() => (open = !open)}
    aria-label="Account Dropdown"
  >
    <div
      class="flex h-full items-center gap-1 rounded px-2 pr-1 transition group-hover/account-button:bg-gray-200 dark:group-hover/account-button:bg-gray-800"
    >
      <div>{account.username}</div>
      <CaretDown
        size={12}
        weight="bold"
        class={cn(
          'text-gray-500 transition-all dark:text-gray-400',
          open && 'rotate-180 transform',
        )}
      />
    </div>
  </button>

  {#if open}
    <div class="relative z-10" transition:slide|local={{ axis: 'y' }} use:popoverElement>
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
          href="/me/api-keys"
        >
          <Key size={18} />
          API Keys
        </a>

        {#if $user?.permissions.genreEditors.canManage}
          <a
            class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
            href="/genre-editors"
          >
            <UsersThree size={18} />
            Genre Editors
          </a>
        {/if}

        <button
          type="button"
          class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
          onclick={() => {
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

        <form method="post" action="/sign-out" use:enhance>
          <button
            class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
            type="submit"
          >
            <SignOut size={18} />
            Sign Out
          </button>
        </form>
      </Card>
    </div>
  {/if}
</div>

<script lang="ts">
  import { offset } from '@floating-ui/dom'
  import type { User } from 'lucia'

  import { enhance } from '$app/forms'
  import { createPopoverActions } from '$lib/actions/popover'
  import Card from '$lib/atoms/Card.svelte'
  import { user, userSettings } from '$lib/contexts/user'
  import ChevronDownIcon from '$lib/icons/ChevronDownIcon.svelte'
  import LogoutIcon from '$lib/icons/LogoutIcon.svelte'
  import MoonIcon from '$lib/icons/MoonIcon.svelte'
  import ProfileIcon from '$lib/icons/ProfileIcon.svelte'
  import SunIcon from '$lib/icons/SunIcon.svelte'
  import { slide } from '$lib/transitions/slide'

  export let account: User

  let open = false

  const [popoverReference, popoverElement] = createPopoverActions({
    placement: 'bottom-end',
    middleware: [offset(4)],
  })
</script>

<button
  use:popoverReference
  class="group/account-button h-full w-full"
  on:click={() => (open = !open)}
>
  <div
    class="flex h-full items-center gap-1 rounded px-2 pr-1 transition group-hover/account-button:bg-gray-200 dark:group-hover/account-button:bg-gray-800"
  >
    <div>{account.username}</div>
    <ChevronDownIcon size={18} class="relative top-px text-gray-500 dark:text-gray-400" />
  </div>
</button>

{#if open}
  <div class="relative z-10" transition:slide|local={{ axis: 'y' }} use:popoverElement>
    <Card class="overflow-hidden shadow">
      <a
        class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
        href="/accounts/{account.id}"
      >
        <ProfileIcon size={18} />
        Profile
      </a>

      <button
        class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
        on:click={() => {
          void fetch(`/api/accounts/${account.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ darkMode: !$userSettings.darkMode }),
          })
            .then((res) => res.json())
            .then((res) => ($user = res))
        }}
      >
        {#if $userSettings.darkMode}
          <MoonIcon size={18} />
          Dark Mode
        {:else}
          <SunIcon size={18} />
          Light Mode
        {/if}
      </button>

      <form method="POST" action="/sign-out" use:enhance>
        <button
          class="flex w-full items-center justify-start gap-1.5 text-nowrap px-2 py-1.5 text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
          type="submit"
        >
          <LogoutIcon size={18} />
          Sign out
        </button>
      </form>
    </Card>
  </div>
{/if}

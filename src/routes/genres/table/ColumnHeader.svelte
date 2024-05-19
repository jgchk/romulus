<script lang="ts">
  import { page } from '$app/stores'
  import SortAscIcon from '$lib/icons/SortAscIcon.svelte'
  import SortDescIcon from '$lib/icons/SortDescIcon.svelte'

  import type { PageData } from './$types'

  export let label: string
  export let sort: string
  export let data: PageData

  let href = ''
  $: {
    const params = new URLSearchParams($page.url.searchParams)

    params.set('sort', sort)
    params.set('page', '1')

    // if the sort is already the same, toggle the order
    if (data.sort === sort) {
      params.set('order', data.order === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('order', 'asc')
    }

    href = '?' + params.toString()
  }
</script>

<a class="flex items-center gap-1" {href}>
  {label}
  {#if data.sort === sort}
    {#if data.order === 'asc'}
      <SortAscIcon class="text-primary-500" size={18} />
    {:else}
      <SortDescIcon class="text-primary-500" size={18} />
    {/if}
  {/if}
</a>

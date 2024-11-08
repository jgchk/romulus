<script lang="ts">
  import { SortAscending, SortDescending } from 'phosphor-svelte'

  import { page } from '$app/stores'

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
      params.set('order', 'desc')
    }

    href = '?' + params.toString()
  }
</script>

<a class="flex items-center gap-1" {href}>
  {label}
  {#if data.sort === sort}
    {#if data.order === 'asc'}
      <SortAscending size={18} class="text-primary-500" />
    {:else}
      <SortDescending size={19} class="text-primary-500" />
    {/if}
  {/if}
</a>

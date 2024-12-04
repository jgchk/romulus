<script lang="ts">
  import { SortAscending, SortDescending } from 'phosphor-svelte'

  import { page } from '$app/stores'

  import type { PageData } from './$types'

  type Props = {
    label: string
    sort: string
    data: PageData
  }

  let { label, sort, data }: Props = $props()

  let href = $derived.by(() => {
    const params = new URLSearchParams($page.url.searchParams)

    params.set('sort', sort)
    params.set('page', '1')

    // if the sort is already the same, toggle the order
    if (data.sort === sort) {
      params.set('order', data.order === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('order', 'asc')
    }

    return '?' + params.toString()
  })
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

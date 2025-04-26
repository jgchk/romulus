<script lang="ts">
  import { CaretDoubleLeft, CaretDoubleRight, CaretLeft, CaretRight } from 'phosphor-svelte'

  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import Input from '$lib/atoms/Input.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import LimitSelect from '$lib/components/LimitSelect.svelte'
  import { toPrettyDate } from '$lib/utils/datetime'
  import { capitalize } from '$lib/utils/string'

  import type { PageData } from './$types'
  import ColumnHeader from './ColumnHeader.svelte'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  let visibleHistory: Awaited<PageData['history']> = $derived.by(() => {
    let val = data.history.sort((a, b) => {
      switch (data.sort) {
        case 'genre':
          return a.name.localeCompare(b.name)
        case 'change':
          return a.operation.localeCompare(b.operation)
        case 'date':
          return a.createdAt.getTime() - b.createdAt.getTime()
      }
    })

    if (data.order === 'desc') {
      val = val.reverse()
    }

    return val.slice((data.page - 1) * data.limit, data.page * data.limit)
  })

  function withPage(searchParams: URLSearchParams, page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return '?' + params.toString()
  }

  function withLimit(searchParams: URLSearchParams, limit: number) {
    const params = new URLSearchParams(searchParams)
    params.set('limit', String(limit))
    params.set('page', '1')
    return '?' + params.toString()
  }

  let totalPages = $derived(Math.ceil(data.history.length / data.limit))
  let firstPageHref = $derived(withPage($page.url.searchParams, 1))
  let lastPageHref = $derived(withPage($page.url.searchParams, totalPages))
  let previousPageHref = $derived(withPage($page.url.searchParams, data.page - 1))
  let nextPageHref = $derived(withPage($page.url.searchParams, data.page + 1))
</script>

<div class="py-2">
  <div>Genres created: {data.numCreated}</div>
  <div>Genres edited: {data.numUpdated}</div>
  <div>Genres deleted: {data.numDeleted}</div>
</div>

<div class="flex-1 overflow-auto p-2">
  <table class="w-full table-fixed overflow-visible">
    <thead>
      <tr>
        <th class="p-1 px-2 text-left">
          <ColumnHeader label="Genre" sort="genre" {data} />
        </th>
        <th class="p-1 px-2 text-left">
          <ColumnHeader label="Change" sort="change" {data} />
        </th>
        <th class="p-1 px-2 text-left">
          <ColumnHeader label="Date" sort="date" {data} />
        </th>
      </tr>
    </thead>
    <tbody>
      {#each visibleHistory as entry (entry.id)}
        <tr>
          <td class="p-1 px-2">
            <GenreLink
              id={entry.treeGenreId}
              name={entry.name}
              type={entry.type}
              subtitle={entry.subtitle}
              nsfw={entry.nsfw}
            />
          </td>
          <td class="p-1 px-2">{capitalize(entry.operation)}</td>
          <td class="p-1 px-2">{toPrettyDate(entry.createdAt)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<div
  class="flex items-center border-t border-gray-200 p-1.5 pl-2 text-sm transition dark:border-gray-800"
>
  <LinkIconButton tooltip="First Page" disabled={data.page === 1} href={firstPageHref}>
    <CaretDoubleLeft />
  </LinkIconButton>
  <LinkIconButton tooltip="Previous Page" href={previousPageHref} disabled={data.page === 1}>
    <CaretLeft />
  </LinkIconButton>
  <LinkIconButton tooltip="Next Page" href={nextPageHref} disabled={data.page === totalPages}>
    <CaretRight />
  </LinkIconButton>
  <LinkIconButton tooltip="Last Page" href={lastPageHref} disabled={data.page === totalPages}>
    <CaretDoubleRight />
  </LinkIconButton>

  <div class="pl-4 text-center">
    Page <span class="font-bold">{data.page} of {totalPages}</span>
  </div>

  <div class="ml-3 border-l border-gray-200 pl-3 transition dark:border-gray-800">
    <span>Go to page:</span>
    <Input
      type="number"
      min="1"
      max={totalPages}
      value={data.page.toString()}
      class="w-20"
      onInput={(e) => {
        const value = Number(e.currentTarget.value)
        if (value < 1 || value > totalPages || Number.isNaN(value)) {
          return
        }

        void goto(withPage($page.url.searchParams, value), { keepFocus: true })
      }}
    />
  </div>

  <div class="pl-2">
    <LimitSelect
      class="w-32"
      value={data.limit}
      onChange={(value) => {
        if (value === undefined) {
          return
        }

        void goto(withLimit($page.url.searchParams, value))
      }}
    />
  </div>
</div>

<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { tooltip } from '$lib/actions/tooltip'
  import Input from '$lib/atoms/Input.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import ChevronLeftFilledIcon from '$lib/icons/ChevronLeftFilledIcon.svelte'
  import ChevronRightFilledIcon from '$lib/icons/ChevronRightFilledIcon.svelte'
  import SkipBackIcon from '$lib/icons/SkipBackIcon.svelte'
  import SkipForwardIcon from '$lib/icons/SkipForwardIcon.svelte'
  import { getTimeSinceShort, toPrettyDate } from '$lib/utils/datetime'

  import RelevanceChip from '../GenreNavigator/GenreTree/RelevanceChip.svelte'
  import type { PageData } from './$types'
  import ColumnHeader from './ColumnHeader.svelte'
  import LimitSelect from './LimitSelect.svelte'

  export let genres: Awaited<PageData['streamed']['genres']>
  export let data: PageData

  let visibleGenres: Awaited<PageData['streamed']['genres']> = []
  $: {
    visibleGenres = genres.sort((a, b) => {
      switch (data.sort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'relevance':
          return a.relevance - b.relevance
        case 'updated':
          return a.updatedAt.getTime() - b.updatedAt.getTime()
      }
    })

    if (data.order === 'desc') {
      visibleGenres = visibleGenres.reverse()
    }

    visibleGenres = visibleGenres.slice((data.page - 1) * data.limit, data.page * data.limit)
  }

  $: totalPages = Math.ceil(genres.length / data.limit)

  $: firstPageHref = withPage($page.url.searchParams, 1)
  $: lastPageHref = withPage($page.url.searchParams, totalPages)
  $: previousPageHref = withPage($page.url.searchParams, data.page - 1)
  $: nextPageHref = withPage($page.url.searchParams, data.page + 1)

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
</script>

<div class="flex h-full w-full flex-col">
  <div class="flex-1 overflow-auto p-2">
    <table class="w-full table-fixed">
      <thead>
        <tr>
          <th class="p-1 px-2 text-left">
            <ColumnHeader label="Name" sort="name" {data} />
          </th>
          <th class="p-1 px-2 text-left">
            <ColumnHeader label="Type" sort="type" {data} />
          </th>
          <th class="p-1 px-2 text-left">
            <ColumnHeader label="Relevance" sort="relevance" {data} />
          </th>
          <th class="p-1 px-2 text-left">
            <ColumnHeader label="Last Updated" sort="updated" {data} />
          </th>
        </tr>
      </thead>
      <tbody>
        {#each visibleGenres as genre (genre.id)}
          <tr>
            <td class="p-1 px-2">
              <GenreLink
                id={genre.id}
                name={genre.name}
                subtitle={genre.subtitle}
                type={genre.type}
              />
              <a class="hover:font-bold" href="/genres/{genre.id}">
                {genre.name}
                {#if genre.subtitle}
                  {' '}
                  <span class="text-sm text-gray-500 transition">
                    [{genre.subtitle}]
                  </span>
                {/if}
              </a>
            </td>
            <td class="p-1 px-2"><GenreTypeChip type={genre.type} /></td>
            <td class="p-1 px-2"><RelevanceChip relevance={genre.relevance} /></td>
            <td class="p-1 px-2"
              ><span use:tooltip={{ content: toPrettyDate(genre.updatedAt) }}
                >{getTimeSinceShort(genre.updatedAt)}</span
              ></td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div
    class="flex items-center border-t border-gray-200 p-1.5 pl-2 text-sm transition dark:border-gray-800"
  >
    <LinkIconButton tooltip="First Page" disabled={data.page === 1} href={firstPageHref}>
      <SkipBackIcon />
    </LinkIconButton>
    <LinkIconButton tooltip="Previous Page" href={previousPageHref} disabled={data.page === 1}>
      <ChevronLeftFilledIcon />
    </LinkIconButton>
    <LinkIconButton tooltip="Next Page" href={nextPageHref} disabled={data.page === totalPages}>
      <ChevronRightFilledIcon />
    </LinkIconButton>
    <LinkIconButton tooltip="Last Page" href={lastPageHref} disabled={data.page === totalPages}>
      <SkipForwardIcon />
    </LinkIconButton>

    <div class="pl-4 text-center">
      Page <span class="font-bold">{data.page} of {totalPages}</span>
    </div>

    <div class="ml-3 border-l border-gray-200 pl-3 dark:border-gray-800">
      <span>Go to page:</span>
      <Input
        type="number"
        min="1"
        max={totalPages}
        value={data.page.toString()}
        class="w-20"
        on:input={(e) => {
          const value = Number(e.currentTarget.value)
          if (value < 1 || value > totalPages || Number.isNaN(value)) {
            return
          }

          void goto(withPage($page.url.searchParams, value))
        }}
      />
    </div>

    <div class="pl-2">
      <LimitSelect
        class="w-32"
        value={data.limit}
        on:change={(e) => {
          const value = e.detail.value
          if (value === undefined) {
            return
          }

          void goto(withLimit($page.url.searchParams, value))
        }}
      />
    </div>
  </div>
</div>

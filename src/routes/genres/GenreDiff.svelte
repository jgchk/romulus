<script lang="ts" context="module">
  const CREATE_SUBITEM_BG = 'bg-success-300 dark:bg-success-700 dark:bg-opacity-25'
  const CREATE_SUBITEM_BORDER = 'border-success-500 dark:border-success-700'
  const CREATE_SUBITEM_CARD = cn(CREATE_SUBITEM_BG, CREATE_SUBITEM_BORDER)

  const UPDATE_SUBITEM_BG = 'bg-warning-300 dark:bg-warning-700 dark:bg-opacity-25'
  const UPDATE_SUBITEM_BORDER = 'border-warning-500 dark:border-warning-700'
  const UPDATE_SUBITEM_CARD = cn(UPDATE_SUBITEM_BG, UPDATE_SUBITEM_BORDER)

  const DELETE_SUBITEM_BG = 'bg-error-300 dark:bg-error-700 dark:bg-opacity-25'
  const DELETE_SUBITEM_BORDER = 'border-error-500 dark:border-error-700'
  const DELETE_SUBITEM_CARD = cn(DELETE_SUBITEM_BG, DELETE_SUBITEM_BORDER)

  type DiffAction = 'create' | 'update' | 'delete' | null

  function getAction<I extends { operation: GenreOperation }, O>(
    previous: I | undefined,
    current: I,
    fn: (hist: I) => O,
  ): DiffAction {
    if (current.operation === 'DELETE') {
      return 'delete'
    }

    const thisValue = fn(current)

    if (!previous) {
      return isEmpty(thisValue) ? null : 'create'
    }

    const lastValue = fn(previous)

    if (isEmpty(lastValue) && !isEmpty(thisValue)) {
      return 'create'
    }

    if (equals(lastValue, thisValue)) {
      return null
    }

    return isEmpty(thisValue) ? 'delete' : 'update'
  }

  const getActionClass = (action: DiffAction) => {
    switch (action) {
      case 'create': {
        return cn('border', CREATE_SUBITEM_CARD)
      }
      case 'update': {
        return cn('border', UPDATE_SUBITEM_CARD)
      }
      case 'delete': {
        return cn('border', DELETE_SUBITEM_CARD)
      }
    }
  }
</script>

<script lang="ts">
  import { equals, isEmpty } from 'ramda'

  import { tooltip } from '$lib/actions/tooltip'
  import Chip from '$lib/atoms/Chip.svelte'
  import CommaList from '$lib/atoms/CommaList.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LoaderLine from '$lib/atoms/LoaderLine.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import Romcode from '$lib/components/Romcode/Romcode.svelte'
  import type { GenreHistory } from '$lib/server/db/schema'
  import type { GenreOperation } from '$lib/types/genres'
  import { getTimeSinceShort, toPrettyDate } from '$lib/utils/datetime'
  import { cn } from '$lib/utils/dom'
  import { capitalize } from '$lib/utils/string'

  import type { LayoutData } from './$types'

  type HistorySubset = Pick<
    GenreHistory,
    | 'name'
    | 'subtitle'
    | 'type'
    | 'shortDescription'
    | 'longDescription'
    | 'notes'
    | 'parentGenreIds'
    | 'influencedByGenreIds'
    | 'operation'
    | 'createdAt'
  > & { akas: string[]; account: { id: number; username: string } | null }
  export let previousHistory: HistorySubset
  export let currentHistory: HistorySubset
  export let genres: LayoutData['streamed']['genres']

  $: changed = {
    name: getAction(previousHistory, currentHistory, (h) => h.name),
    subtitle: getAction(previousHistory, currentHistory, (h) => h.subtitle),
    type: getAction(previousHistory, currentHistory, (h) => h.type),
    shortDescription: getAction(previousHistory, currentHistory, (h) => h.shortDescription),
    longDescription: getAction(previousHistory, currentHistory, (h) => h.longDescription),
    notes: getAction(previousHistory, currentHistory, (h) => h.notes),
    akas: getAction(previousHistory, currentHistory, (h) => h.akas),
    parentGenreIds: getAction(previousHistory, currentHistory, (h) => new Set(h.parentGenreIds)),
    influencedByGenreIds: getAction(
      previousHistory,
      currentHistory,
      (h) => new Set(h.influencedByGenreIds),
    ),
  }
</script>

<div class="rounded border border-gray-700">
  <div class="flex w-full items-center justify-between gap-2 border-b border-gray-700 p-2">
    <Chip
      class={cn(
        currentHistory.operation === 'DELETE' && 'text-error-500',
        currentHistory.operation === 'CREATE' && 'text-success-500',
        currentHistory.operation === 'UPDATE' && 'text-warning-500',
      )}
      text={capitalize(currentHistory.operation)}
    />
    {#if currentHistory.account}
      <a
        href="/accounts/{currentHistory.account.id}"
        class="text-xs text-primary-500 hover:underline">{currentHistory.account.username}</a
      >
    {:else}
      <div class="text-gray-500 line-through">Deleted</div>
    {/if}
    <div class="text-xs text-gray-400">
      <span class="cursor-default" use:tooltip={{ content: toPrettyDate(currentHistory.createdAt) }}
        >{getTimeSinceShort(currentHistory.createdAt)}</span
      >
    </div>
  </div>
  <div>
    {#if currentHistory.operation === 'DELETE'}
      <div class="text-red-500 flex flex-1 items-center justify-center text-sm">Deleted</div>
    {:else}
      <div class="space-y-1 p-1">
        <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.name))}>
          <Label>Name</Label>
          <div>{currentHistory.name}</div>
        </div>
        {#if currentHistory.subtitle}
          <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.subtitle))}>
            <Label>Subtitle</Label>
            <div>{currentHistory.subtitle}</div>
          </div>
        {/if}
        <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.type))}>
          <Label>Type</Label>
          <div>
            <GenreTypeChip type={currentHistory.type} />
          </div>
        </div>
        {#if currentHistory.shortDescription}
          <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.shortDescription))}>
            <Label>Short Description</Label>
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              <Romcode data={currentHistory.shortDescription ?? ''} {genres} />
            {/await}
          </div>
        {/if}
        {#if currentHistory.longDescription}
          <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.longDescription))}>
            <Label>Long Description</Label>
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              <Romcode data={currentHistory.longDescription ?? ''} {genres} />
            {/await}
          </div>
        {/if}
        {#if currentHistory.notes}
          <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.notes))}>
            <Label>Notes</Label>
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              <Romcode data={currentHistory.notes ?? ''} {genres} />
            {/await}
          </div>
        {/if}
        {#if currentHistory.akas.length}
          <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.akas))}>
            <Label>AKAs</Label>
            <div>{currentHistory.akas.join(', ')}</div>
          </div>
        {/if}
        {#if currentHistory.parentGenreIds?.length}
          <div>
            <Label>Parents</Label>
            <div class={cn('rounded p-1 px-2 transition', getActionClass(changed.parentGenreIds))}>
              {#await genres}
                <div class="flex h-[26px] items-center">
                  <LoaderLine class="text-gray-500" />
                </div>
              {:then genres}
                <CommaList
                  items={currentHistory.parentGenreIds}
                  let:item={id}
                  class="text-gray-600 transition dark:text-gray-400"
                >
                  {@const genre = genres.find((g) => g.id === id)}
                  {#if genre}
                    <GenreLink {id} name={genre.name} type={genre.type} subtitle={genre.subtitle} />
                  {:else}
                    <GenreLink {id} name="Deleted" class="text-gray-500 line-through" />
                  {/if}
                </CommaList>
              {/await}
            </div>
          </div>
        {/if}
        {#if currentHistory.influencedByGenreIds?.length}
          <div>
            <Label>Influences</Label>
            <div
              class={cn(
                'rounded p-1 px-2 transition',
                getActionClass(changed.influencedByGenreIds),
              )}
            >
              {#await genres}
                <div class="flex h-[26px] items-center">
                  <LoaderLine class="text-gray-500" />
                </div>
              {:then genres}
                <CommaList
                  items={currentHistory.influencedByGenreIds}
                  let:item={id}
                  class="text-gray-600 transition dark:text-gray-400"
                >
                  {@const genre = genres.find((g) => g.id === id)}
                  {#if genre}
                    <GenreLink {id} name={genre.name} type={genre.type} subtitle={genre.subtitle} />
                  {:else}
                    <GenreLink {id} name="Deleted" class="text-gray-500 line-through" />
                  {/if}
                </CommaList>
              {/await}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

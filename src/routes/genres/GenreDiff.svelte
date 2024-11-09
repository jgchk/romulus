<script lang="ts">
  import { CaretDown } from 'phosphor-svelte'
  import { equals, isEmpty, isNil } from 'ramda'
  import { onMount } from 'svelte'

  import { tooltip } from '$lib/actions/tooltip'
  import Chip from '$lib/atoms/Chip.svelte'
  import CommaList from '$lib/atoms/CommaList.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LoaderLine from '$lib/atoms/LoaderLine.svelte'
  import AccountLink from '$lib/components/AccountLink.svelte'
  import Romcode from '$lib/components/Romcode/Romcode.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
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
    | 'nsfw'
    | 'shortDescription'
    | 'longDescription'
    | 'notes'
    | 'parentGenreIds'
    | 'influencedByGenreIds'
    | 'operation'
    | 'createdAt'
    | 'treeGenreId'
  > & { akas: string[]; account: { id: number; username: string } | null }

  type Props = {
    previousHistory: Omit<HistorySubset, 'account'> | undefined
    currentHistory: HistorySubset
    genres: LayoutData['streamed']['genres']
  }

  let { previousHistory, currentHistory, genres }: Props = $props()

  let expanded = $state(false)

  const SHORT_HEIGHT = 220

  let body: HTMLElement | undefined = $state()
  let scrollHeight = $state(0)

  const userSettings = getUserSettingsContext()

  onMount(() => {
    const cb = () => {
      scrollHeight = body?.scrollHeight ?? 0
      requestAnimationFrame(cb)
    }

    cb()
  })

  type DiffAction = 'create' | 'update' | 'delete' | null

  function getAction<I extends { operation: GenreOperation }, O>(
    previous: I | undefined,
    current: I,
    fn: (hist: I) => O,
  ): DiffAction {
    if (current.operation === 'DELETE') {
      return 'delete'
    }

    let thisValue = fn(current)

    if (!previous) {
      return isNil(thisValue) || isEmpty(thisValue) ? null : 'create'
    }

    let lastValue = fn(previous)

    if ((isNil(lastValue) || isEmpty(lastValue)) && !(isNil(thisValue) || isEmpty(thisValue))) {
      return 'create'
    }

    if (equals(lastValue, thisValue)) {
      return null
    }

    return isNil(thisValue) || isEmpty(thisValue) ? 'delete' : 'update'
  }

  const getLabelClass = (action: DiffAction) => {
    switch (action) {
      case 'create': {
        return 'text-success-500 dark:text-success-500 transition'
      }
      case 'update': {
        return 'text-warning-500 dark:text-warning-500 transition'
      }
      case 'delete': {
        return 'text-error-500 dark:text-error-500 transition'
      }
    }
  }
  let overflows = $derived(scrollHeight > SHORT_HEIGHT)
  let changed = $derived({
    name: getAction(previousHistory, currentHistory, (h) => h.name),
    subtitle: getAction(previousHistory, currentHistory, (h) => h.subtitle),
    type: getAction(previousHistory, currentHistory, (h) => h.type),
    nsfw: getAction(previousHistory, currentHistory, (h) => h.nsfw),
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
  })
</script>

<div
  class={cn(
    'genre-diff rounded border border-gray-300 bg-gray-200 transition dark:border-gray-700 dark:bg-gray-800',
    currentHistory.nsfw && !$userSettings.showNsfw && 'blur-sm',
  )}
  data-testid="genre-diff"
  use:tooltip={{
    content: 'Enable NSFW genres in settings to view this genre',
    enabled: currentHistory.nsfw && !$userSettings.showNsfw,
  }}
>
  <div
    class="flex w-full items-center justify-between gap-2 border-b border-gray-300 p-2 transition dark:border-gray-700"
  >
    <Chip
      class={cn(
        currentHistory.operation === 'DELETE' && 'text-error-500',
        currentHistory.operation === 'CREATE' && 'text-success-500',
        currentHistory.operation === 'UPDATE' && 'text-warning-500',
      )}
      text={capitalize(currentHistory.operation)}
      data-testid="genre-diff-operation"
    />
    {#if currentHistory.account}
      <AccountLink
        accountId={currentHistory.account.id}
        username={currentHistory.account.username}
        class="text-xs"
        data-testid="genre-diff-account"
      />
    {:else}
      <div class="text-gray-500 line-through" data-testid="genre-diff-account">Deleted</div>
    {/if}
    <div class="text-xs text-gray-600 transition dark:text-gray-400" data-testid="genre-diff-time">
      <span class="cursor-default" use:tooltip={{ content: toPrettyDate(currentHistory.createdAt) }}
        >{getTimeSinceShort(currentHistory.createdAt)}</span
      >
    </div>
  </div>
  <div
    bind:this={body}
    class="relative overflow-hidden p-2 transition-all"
    style={`max-height: ${expanded ? scrollHeight + 5 : SHORT_HEIGHT}px;`}
  >
    <div class="space-y-1 p-1">
      <div class={cn(!changed.name && 'opacity-50')}>
        <Label class={cn('text-xs', getLabelClass(changed.name))}>Name</Label>
        <div class="text-sm" data-testid="genre-diff-name">
          {#if changed.name === 'delete'}
            <span class="text-gray-500 line-through">{currentHistory.name}</span>
          {:else if changed.name === 'update'}
            <a class="hover:underline" href="/genres/{currentHistory.treeGenreId}"
              >{currentHistory.name}</a
            > <span class="text-gray-500 line-through">{previousHistory?.name}</span>
          {:else}
            <a class="hover:underline" href="/genres/{currentHistory.treeGenreId}"
              >{currentHistory.name}</a
            >
          {/if}
        </div>
      </div>

      {#if previousHistory?.subtitle ?? currentHistory.subtitle}
        <div class={cn(!changed.subtitle && 'opacity-50')}>
          <Label class={cn('text-xs', getLabelClass(changed.subtitle))}>Subtitle</Label>
          <div class="text-sm" data-testid="genre-diff-subtitle">
            {#if changed.subtitle === 'delete'}
              <span class="text-gray-500 line-through">{currentHistory.subtitle}</span>
            {:else if changed.subtitle === 'update'}
              <span>{currentHistory.subtitle}</span>
              <span class="text-gray-500 line-through">{previousHistory?.subtitle}</span>
            {:else}
              <span>{currentHistory.subtitle}</span>
            {/if}
          </div>
        </div>
      {/if}

      <div class={cn(!changed.type && 'opacity-50')}>
        <Label class={cn('text-xs', getLabelClass(changed.type))}>Type</Label>
        <div class="text-sm" data-testid="genre-diff-type">
          {#if changed.type === 'delete'}
            <span class="text-gray-500 line-through">{capitalize(currentHistory.type)}</span>
          {:else if changed.type === 'update'}
            <span>{capitalize(currentHistory.type)}</span>
            <span class="text-gray-500 line-through">{capitalize(previousHistory?.type ?? '')}</span
            >
          {:else}
            <span>{capitalize(currentHistory.type)}</span>
          {/if}
        </div>
      </div>

      {#if previousHistory?.akas.length ?? currentHistory.akas.length}
        <div class={cn(!changed.akas && 'opacity-50')}>
          <Label class={cn('text-xs', getLabelClass(changed.akas))}>AKAs</Label>
          <div class="text-sm" data-testid="genre-diff-akas">
            {#if changed.type === 'delete'}
              <div class="text-gray-500 line-through">{currentHistory.akas.join(', ')}</div>
            {:else if changed.type === 'update'}
              <div>{currentHistory.akas.join(', ')}</div>
              <div class="text-gray-500 line-through">{previousHistory?.akas.join(', ')}</div>
            {:else}
              <div>{currentHistory.akas.join(', ')}</div>
            {/if}
          </div>
        </div>
      {/if}

      {#if previousHistory?.parentGenreIds?.length ?? currentHistory.parentGenreIds?.length}
        <div class={cn(!changed.parentGenreIds && 'opacity-50')}>
          <Label class={cn('text-xs', getLabelClass(changed.parentGenreIds))}>Parents</Label>
          <div class="text-sm" data-testid="genre-diff-parents">
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              {#if changed.parentGenreIds === 'delete'}
                <CommaList items={currentHistory.parentGenreIds ?? []} class="block text-gray-500">
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="line-through hover:underline" href="/genres/{genre.id}"
                        >{genre.name}</a
                      >
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
              {:else if changed.parentGenreIds === 'update'}
                <CommaList items={currentHistory.parentGenreIds ?? []} class="block">
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="hover:underline" href="/genres/{genre.id}">{genre.name}</a>
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
                <CommaList
                  items={previousHistory?.parentGenreIds ?? []}
                  class="block text-gray-500"
                >
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="line-through hover:underline" href="/genres/{genre.id}"
                        >{genre.name}</a
                      >
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
              {:else}
                <CommaList items={currentHistory.parentGenreIds ?? []} class="block">
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="hover:underline" href="/genres/{genre.id}">{genre.name}</a>
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
              {/if}
            {/await}
          </div>
        </div>
      {/if}

      {#if previousHistory?.influencedByGenreIds?.length ?? currentHistory.influencedByGenreIds?.length}
        <div class={cn(!changed.influencedByGenreIds && 'opacity-50')}>
          <Label class={cn('text-xs', getLabelClass(changed.influencedByGenreIds))}
            >Influences</Label
          >
          <div class="text-sm" data-testid="genre-diff-influences">
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              {#if changed.influencedByGenreIds === 'delete'}
                <CommaList
                  items={currentHistory.influencedByGenreIds ?? []}
                  class="block text-gray-500"
                >
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="line-through hover:underline" href="/genres/{genre.id}"
                        >{genre.name}</a
                      >
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
              {:else if changed.influencedByGenreIds === 'update'}
                <CommaList items={currentHistory.influencedByGenreIds ?? []} class="block">
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="hover:underline" href="/genres/{genre.id}">{genre.name}</a>
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
                <CommaList
                  items={previousHistory?.influencedByGenreIds ?? []}
                  class="block text-gray-500"
                >
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="line-through hover:underline" href="/genres/{genre.id}"
                        >{genre.name}</a
                      >
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
              {:else}
                <CommaList items={currentHistory.influencedByGenreIds ?? []} class="block">
                  {#snippet children({ item: id })}
                    {@const genre = genres.find((g) => g.id === id)}
                    {#if genre}
                      <a class="hover:underline" href="/genres/{genre.id}">{genre.name}</a>
                    {:else}
                      <span class="text-gray-500 line-through">Deleted</span>
                    {/if}
                  {/snippet}
                </CommaList>
              {/if}
            {/await}
          </div>
        </div>
      {/if}

      <div class={cn(!changed.nsfw && 'opacity-50')}>
        <Label class={cn('text-xs', getLabelClass(changed.nsfw))}>NSFW</Label>
        <div class="text-sm" data-testid="genre-diff-nsfw">
          {#if changed.nsfw === 'delete'}
            <span class="text-gray-500 line-through"
              >{capitalize(currentHistory.nsfw.toString())}</span
            >
          {:else if changed.nsfw === 'update'}
            <span>{capitalize(currentHistory.nsfw.toString())}</span>
            <span class="text-gray-500 line-through"
              >{capitalize(previousHistory?.nsfw?.toString() ?? '')}</span
            >
          {:else}
            <span>{capitalize(currentHistory.nsfw.toString())}</span>
          {/if}
        </div>
      </div>

      {#if previousHistory?.shortDescription ?? currentHistory.shortDescription}
        <div class={cn(!changed.shortDescription && 'opacity-50')}>
          <Label class={cn('text-xs', getLabelClass(changed.shortDescription))}
            >Short Description</Label
          >
          <div class="text-sm" data-testid="genre-diff-short-description">
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              {#if changed.shortDescription === 'delete'}
                <span class="line-through opacity-50">
                  <Romcode data={previousHistory?.shortDescription ?? ''} {genres} />
                </span>
              {:else}
                <span>
                  <Romcode data={currentHistory.shortDescription ?? ''} {genres} />
                </span>
              {/if}
            {/await}
          </div>
        </div>
      {/if}

      {#if previousHistory?.longDescription ?? currentHistory.longDescription}
        <div class={cn(!changed.longDescription && 'opacity-50')}>
          <Label class={cn('text-xs', getLabelClass(changed.longDescription))}
            >Long Description</Label
          >
          <div class="text-sm" data-testid="genre-diff-long-description">
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              {#if changed.longDescription === 'delete'}
                <span class="line-through opacity-50">
                  <Romcode data={previousHistory?.longDescription ?? ''} {genres} />
                </span>
              {:else}
                <span>
                  <Romcode data={currentHistory.longDescription ?? ''} {genres} />
                </span>
              {/if}
            {/await}
          </div>
        </div>
      {/if}

      {#if previousHistory?.notes ?? currentHistory.notes}
        <div class={cn(!changed.notes && 'opacity-50')}>
          <Label class={cn('text-xs', getLabelClass(changed.notes))}>Notes</Label>
          <div class="text-sm" data-testid="genre-diff-notes">
            {#await genres}
              <div class="flex h-[26px] items-center">
                <LoaderLine class="text-gray-500" />
              </div>
            {:then genres}
              {#if changed.notes === 'delete'}
                <span class="line-through opacity-50">
                  <Romcode data={previousHistory?.notes ?? ''} {genres} />
                </span>
              {:else}
                <span>
                  <Romcode data={currentHistory.notes ?? ''} {genres} />
                </span>
              {/if}
            {/await}
          </div>
        </div>
      {/if}
    </div>
    {#if overflows && !expanded}
      <div
        class="absolute bottom-0 h-4 w-full bg-gradient-to-t from-gray-200 to-transparent transition dark:from-gray-800"
      ></div>
    {/if}
  </div>
  {#if overflows}
    <button
      type="button"
      class="group w-full p-1 text-sm text-gray-500 transition hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
      onclick={() => (expanded = !expanded)}
    >
      <div
        class="flex w-full items-center justify-center gap-1 rounded-sm bg-transparent p-0.5 transition group-hover:bg-gray-300 dark:group-hover:bg-gray-700"
      >
        {#if expanded}
          Collapse
        {:else}
          Expand
        {/if}
        <CaretDown
          size={12}
          weight="bold"
          class={cn('transform transition-transform', expanded && 'rotate-180')}
        />
      </div>
    </button>
  {/if}
</div>

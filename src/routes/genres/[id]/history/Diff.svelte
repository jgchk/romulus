<script lang="ts" context="module">
  const DEFAULT_BG = 'bg-gray-100 dark:bg-gray-800'
  const DEFAULT_BORDER = 'border-gray-300 dark:border-gray-600'
  const DEFAULT_CARD = cn(DEFAULT_BG, DEFAULT_BORDER)

  const CREATE_BG = 'bg-success-100 dark:bg-success-800 dark:bg-opacity-25'
  const CREATE_BORDER = 'border-success-300 dark:border-success-800'
  const CREATE_CARD = cn(CREATE_BG, CREATE_BORDER)

  const CREATE_SUBITEM_BG = 'bg-success-300 dark:bg-success-700 dark:bg-opacity-25'
  const CREATE_SUBITEM_BORDER = 'border-success-500 dark:border-success-700'
  const CREATE_SUBITEM_CARD = cn(CREATE_SUBITEM_BG, CREATE_SUBITEM_BORDER)

  const UPDATE_SUBITEM_BG = 'bg-warning-300 dark:bg-warning-700 dark:bg-opacity-25'
  const UPDATE_SUBITEM_BORDER = 'border-warning-500 dark:border-warning-700'
  const UPDATE_SUBITEM_CARD = cn(UPDATE_SUBITEM_BG, UPDATE_SUBITEM_BORDER)

  const DELETE_BG = 'bg-error-100 dark:bg-error-800 dark:bg-opacity-25'
  const DELETE_BORDER = 'border-error-300 dark:border-error-800'
  const DELETE_CARD = cn(DELETE_BG, DELETE_BORDER)

  const DELETE_SUBITEM_BG = 'bg-error-300 dark:bg-error-700 dark:bg-opacity-25'
  const DELETE_SUBITEM_BORDER = 'border-error-500 dark:border-error-700'
  const DELETE_SUBITEM_CARD = cn(DELETE_SUBITEM_BG, DELETE_SUBITEM_BORDER)
</script>

<script lang="ts">
  import { equals, isEmpty } from 'ramda'

  import Label from '$lib/atoms/Label.svelte'
  import Loader from '$lib/atoms/Loader.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import Romcode from '$lib/components/Romcode/Romcode.svelte'
  import { slide } from '$lib/transitions/slide'
  import { cn } from '$lib/utils/dom'

  import type { PageData } from './$types'

  export let genres: PageData['streamed']['genres']
  export let previousHistory: PageData['genreHistory'][number] | undefined
  export let currentHistory: PageData['genreHistory'][number]

  $: changed = {
    name: getAction((h) => h.name),
    subtitle: getAction((h) => h.subtitle),
    type: getAction((h) => h.type),
    shortDescription: getAction((h) => h.shortDescription),
    longDescription: getAction((h) => h.longDescription),
    notes: getAction((h) => h.notes),
    akas: getAction((h) => new Set(h.akas)),
    parentGenreIds: getAction((h) => new Set(h.parentGenreIds)),
    influencedByGenreIds: getAction((h) => new Set(h.influencedByGenreIds)),
  }

  type DiffAction = 'create' | 'update' | 'delete' | null
  function getAction<T>(fn: (hist: PageData['genreHistory'][number]) => T): DiffAction {
    if (currentHistory.operation === 'DELETE') {
      return 'delete'
    }

    const thisValue = fn(currentHistory)

    if (!previousHistory) {
      return isEmpty(thisValue) ? null : 'create'
    }

    const lastValue = fn(previousHistory)

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

{#await genres}
  <div class="center h-full max-h-96 w-full">
    <Loader size={32} class="text-primary-500" />
  </div>
{:then genres}
  <div class="flex gap-3" transition:slide|local={{ axis: 'y' }}>
    {#if previousHistory}
      <div class={cn('flex-1 rounded border', DEFAULT_CARD)}>
        <div
          class={cn(
            'border-b p-2 px-3 text-sm font-bold uppercase tracking-wide text-gray-500',
            DEFAULT_BORDER,
          )}
        >
          Before
        </div>
        <div class="space-y-3 p-2 px-3">
          <div>
            <Label>Name</Label>
            <div>{previousHistory.name}</div>
          </div>
          {#if previousHistory.subtitle}
            <div>
              <Label>Subtitle</Label>
              <div>{previousHistory.subtitle}</div>
            </div>
          {/if}
          <div>
            <Label>Type</Label>
            <div>
              <GenreTypeChip type={previousHistory.type} />
            </div>
          </div>
          {#if previousHistory.shortDescription}
            <div>
              <Label>Short Description</Label>
              <Romcode data={previousHistory.shortDescription} {genres} />
            </div>
          {/if}
          {#if previousHistory.longDescription}
            <div>
              <Label>Long Description</Label>
              <Romcode data={previousHistory.longDescription} {genres} />
            </div>
          {/if}
          {#if previousHistory.notes}
            <div>
              <Label>Notes</Label>
              <Romcode data={previousHistory.notes} {genres} />
            </div>
          {/if}
          {#if previousHistory.akas.length > 0}
            <div>
              <Label>AKAs</Label>
              <div>{previousHistory.akas.join(', ')}</div>
            </div>
          {/if}
          {#if previousHistory.parentGenreIds?.length}
            <div>
              <Label>Parents</Label>
              <div>
                <ul class="comma-list">
                  {#each previousHistory.parentGenreIds as id (id)}
                    {@const genre = genres.find((g) => g.id === id)}
                    <li class="block">
                      {#if genre}
                        <a href="/genres/{id}" class="font-bold text-primary-500 hover:underline">
                          {genre.name}
                          {#if genre.type !== 'STYLE'}
                            {' '}
                            <GenreTypeChip
                              type={genre.type}
                              class="bg-primary-100 text-primary-400"
                            />
                          {/if}
                        </a>
                      {:else}
                        <a
                          href="/genres/{id}"
                          class="font-bold text-gray-500 line-through hover:underline"
                        >
                          Deleted
                        </a>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
          {#if previousHistory.influencedByGenreIds?.length}
            <div>
              <Label>Influences</Label>
              <div>
                <ul class="comma-list">
                  {#each previousHistory.influencedByGenreIds as id (id)}
                    {@const genre = genres.find((g) => g.id === id)}
                    <li class="block">
                      {#if genre}
                        <a href="/genres/{id}" class="font-bold text-primary-500 hover:underline">
                          {genre.name}
                          {#if genre.type !== 'STYLE'}
                            {' '}
                            <GenreTypeChip
                              type={genre.type}
                              class="bg-primary-100 text-primary-400"
                            />
                          {/if}
                        </a>
                      {:else}
                        <a
                          href="/genres/{id}"
                          class="font-bold text-gray-500 line-through hover:underline"
                        >
                          Deleted
                        </a>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class={cn('flex flex-1 flex-col rounded border', DEFAULT_CARD)}>
        <div
          class={cn(
            'border-b p-2 px-3 text-sm font-bold uppercase tracking-wide text-gray-500',
            DEFAULT_BORDER,
          )}
        >
          Before
        </div>
        <div class="flex flex-1 items-center justify-center text-sm text-gray-500">None</div>
      </div>
    {/if}

    {#if currentHistory.operation === 'DELETE'}
      <div class={cn('flex flex-1 flex-col rounded border', DELETE_CARD)}>
        <div
          class={cn(
            'text-red-500 border-b p-2 px-3 text-sm font-bold uppercase tracking-wide',
            DELETE_BORDER,
          )}
        >
          After
        </div>
        <div class="text-red-500 flex flex-1 items-center justify-center text-sm">Deleted</div>
      </div>
    {:else}
      <div
        class={cn(
          'flex-1 rounded border',
          currentHistory.operation === 'CREATE' ? CREATE_CARD : DEFAULT_CARD,
        )}
      >
        <div
          class={cn(
            'border-b p-2 px-3 text-sm font-bold uppercase tracking-wide',
            currentHistory.operation === 'CREATE'
              ? cn('text-green-500', CREATE_BORDER)
              : cn('text-gray-500', DEFAULT_BORDER),
          )}
        >
          After
        </div>
        <div class="space-y-1 p-1">
          <div class={cn('rounded p-1 px-2', getActionClass(changed.name))}>
            <Label>Name</Label>
            <div>{currentHistory.name}</div>
          </div>
          {#if currentHistory.subtitle}
            <div class={cn('rounded p-1 px-2', getActionClass(changed.subtitle))}>
              <Label>Subtitle</Label>
              <div>{currentHistory.subtitle}</div>
            </div>
          {/if}
          <div class={cn('rounded p-1 px-2', getActionClass(changed.type))}>
            <Label>Type</Label>
            <div>
              <GenreTypeChip type={currentHistory.type} />
            </div>
          </div>
          {#if currentHistory.shortDescription}
            <div class={cn('rounded p-1 px-2', getActionClass(changed.shortDescription))}>
              <Label>Short Description</Label>
              <Romcode data={currentHistory.shortDescription ?? ''} {genres} />
            </div>
          {/if}
          {#if currentHistory.longDescription}
            <div class={cn('rounded p-1 px-2', getActionClass(changed.longDescription))}>
              <Label>Long Description</Label>
              <Romcode data={currentHistory.longDescription ?? ''} {genres} />
            </div>
          {/if}
          {#if currentHistory.notes}
            <div class={cn('rounded p-1 px-2', getActionClass(changed.notes))}>
              <Label>Notes</Label>
              <Romcode data={currentHistory.notes ?? ''} {genres} />
            </div>
          {/if}
          {#if currentHistory.akas.length}
            <div class={cn('rounded p-1 px-2', getActionClass(changed.akas))}>
              <Label>AKAs</Label>
              <div>{currentHistory.akas.join(', ')}</div>
            </div>
          {/if}
          {#if currentHistory.parentGenreIds?.length}
            <div>
              <Label>Parents</Label>
              <div class={cn('rounded p-1 px-2', getActionClass(changed.parentGenreIds))}>
                <ul class="comma-list">
                  {#each currentHistory.parentGenreIds as id (id)}
                    {@const genre = genres.find((g) => g.id === id)}
                    <li class="block">
                      {#if genre}
                        <a href="/genres/{id}" class="font-bold text-primary-500 hover:underline">
                          {genre.name}
                          {#if genre.type !== 'STYLE'}
                            {' '}
                            <GenreTypeChip
                              type={genre.type}
                              class="bg-primary-100 text-primary-400"
                            />
                          {/if}
                        </a>
                      {:else}
                        <a
                          href="/genres/{id}"
                          class="font-bold text-gray-500 line-through hover:underline"
                        >
                          Deleted
                        </a>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
          {#if currentHistory.influencedByGenreIds?.length}
            <div>
              <Label>Influences</Label>
              <div class={cn('rounded p-1 px-2', getActionClass(changed.influencedByGenreIds))}>
                <ul class="comma-list">
                  {#each currentHistory.influencedByGenreIds as id (id)}
                    {@const genre = genres.find((g) => g.id === id)}
                    <li class="block">
                      {#if genre}
                        <a href="/genres/{id}" class="font-bold text-primary-500 hover:underline">
                          {genre.name}
                          {#if genre.type !== 'STYLE'}
                            {' '}
                            <GenreTypeChip
                              type={genre.type}
                              class="bg-primary-100 text-primary-400"
                            />
                          {/if}
                        </a>
                      {:else}
                        <a
                          href="/genres/{id}"
                          class="font-bold text-gray-500 line-through hover:underline"
                        >
                          Deleted
                        </a>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/await}

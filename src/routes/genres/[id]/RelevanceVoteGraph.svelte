<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip'
  import {
    getGenreRelevanceText,
    MAX_GENRE_RELEVANCE,
    MIN_GENRE_RELEVANCE,
  } from '$lib/types/genres'
  import { range } from '$lib/utils/array'
  import { cn } from '$lib/utils/dom'
  import { sum } from '$lib/utils/math'

  import type { PageData } from './$types'

  export let votes: PageData['relevanceVotes']
  $: totalVotes = sum([...votes.values()])

  const getColor = (relevance: number) => {
    switch (relevance) {
      case 0: {
        return 'bg-primary-50 border-y border-r border-primary-200'
      }
      case 1: {
        return 'bg-primary-100 border-y border-r border-primary-300'
      }
      case 2: {
        return 'bg-primary-200 border-y border-r border-primary-400'
      }
      case 3: {
        return 'bg-primary-300 border-y border-r border-primary-500'
      }
      case 4: {
        return 'bg-primary-400 border-y border-r border-primary-600'
      }
      case 5: {
        return 'bg-primary-500 border-y border-r border-primary-700'
      }
      case 6: {
        return 'bg-primary-600'
      }
      case 7: {
        return 'bg-primary-700'
      }
    }
  }
</script>

{#each range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1).reverse() as relevance (relevance)}
  {@const count = votes.get(relevance) ?? 0}
  {@const percentage = (count / totalVotes) * 0.95}

  <div class="flex items-center">
    <div
      use:tooltip={{ content: getGenreRelevanceText(relevance) }}
      class="flex h-6 w-4 cursor-default items-center border-r border-gray-300 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
    >
      {relevance}
    </div>

    {#if percentage > 0}
      <div class={cn('h-5 rounded-r', getColor(relevance))} style="width: {percentage * 100}%" />
    {/if}

    <div class="ml-2 cursor-default text-sm font-medium text-gray-600 dark:text-gray-400">
      {count}
    </div>
  </div>
{/each}

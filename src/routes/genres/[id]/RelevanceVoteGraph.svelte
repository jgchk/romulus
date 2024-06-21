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

  const relevanceData: Record<number, { color: string; docs: string }> = {
    7: {
      color: 'bg-primary-700',
      docs:
        `${getGenreRelevanceText(7)}: ` +
        'These are terms that basically anybody with any degree of proximity to the ' +
        "international culture understands, even if they don't listen to anything even " +
        'vaguely related. Terms at this level are frequently huge and broad, encompassing ' +
        'vast swathes of music that have remained relevant to contemporary culture for so ' +
        'long and at such a high level as to basically be impossible to not know of unless ' +
        'you are entirely cut off from any outside communication.',
    },
    6: {
      color: 'bg-primary-600',
      docs:
        `${getGenreRelevanceText(6)}: ` +
        'These are terms that pretty much anyone checked into the relevant contemporary ' +
        'culture at any level knows about. Terms at this level are understood on at ' +
        'least a basic relevant level by people who may not be even the most casual ' +
        'fan of whatever larger genre they inhabit. If you can ask your parents or a random ' +
        "coworker about this term and be at least fairly on the same page, it's a 6.",
    },
    5: {
      color: 'bg-primary-500 border-y border-r border-primary-700',
      docs:
        `${getGenreRelevanceText(5)}: ` +
        'These are terms that anyone with surface level knowledge of a subculture ' +
        'would know. At this stage, you need to choose to engage with said subculture ' +
        'on at least a basic level - pretty much any fan of electronic music, even the ' +
        "most basic and surface level one, knows what house is, but someone who doesn't " +
        "know anything about electronic music probably doesn't have a strong concept of " +
        'what it is. This is the basic level of distinction needed to cover a specific subculture.',
    },
    4: {
      color: 'bg-primary-400 border-y border-r border-primary-600',
      docs:
        `${getGenreRelevanceText(4)}: ` +
        "These are terms that are well known in a specific subculture but aren't quite " +
        'universal within them like terms rated 5 are. They have a level of status and ' +
        'significance that make them pretty much indispensable as legitimate objects, ' +
        'though they typically occupy at least some sort of niche within it.',
    },
    3: {
      color: 'bg-primary-300 border-y border-r border-primary-500',
      docs:
        `${getGenreRelevanceText(3)}: ` +
        'These are terms that are established and have some level of recognition ' +
        'within a subculture but are fairly niche and require a level of nerdiness about ' +
        'genres to really care about. They represent things that a lot of people in a ' +
        'subculture will find to be unnecessary, if not outright argue against its existence.',
    },
    2: {
      color: 'bg-primary-200 border-y border-r border-primary-400',
      docs:
        `${getGenreRelevanceText(2)}: ` +
        'These are terms that are extremely niche and are not established as terms ' +
        'and distinctions even within their specific subculture. These terms are often either ' +
        'obscure names for larger objects that have yet to catch on or never caught on, or ' +
        "refer to very specific and/or obscure objects that aren't popular enough to warrant " +
        'a widespread term in the first place.',
    },
    1: {
      color: 'bg-primary-100 border-y border-r border-primary-300',
      docs:
        `${getGenreRelevanceText(1)}: ` +
        'These are terms that are almost entirely unknown and essentially require being ' +
        'part of an extremely specific niche to have even heard, let alone understand and ' +
        'recognize as real.',
    },
    0: {
      color: 'bg-primary-50 border-y border-r border-primary-200',
      docs:
        `${getGenreRelevanceText(0)}: ` +
        'These are terms that are invented by Romulus users and are essentially unused outside of the site.',
    },
  }
</script>

{#each range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1).reverse() as relevance (relevance)}
  {@const count = votes.get(relevance) ?? 0}
  {@const percentage = (count / totalVotes) * 0.95}

  <div class="flex items-center">
    <div
      class="h-6 w-9 cursor-default border-r border-gray-300 text-sm text-gray-700 transition dark:border-gray-700 dark:text-gray-300"
    >
      {relevance}{' '}<span
        class="cursor-help text-primary-500"
        use:tooltip={{ content: relevanceData[relevance].docs }}>(?)</span
      >
    </div>

    {#if percentage > 0}
      <div
        class={cn('h-5 rounded-r', relevanceData[relevance].color)}
        style="width: {percentage * 100}%"
      />
    {/if}

    <div
      class="ml-2 cursor-default text-sm font-medium text-gray-600 transition dark:text-gray-400"
    >
      {count}
    </div>
  </div>
{/each}

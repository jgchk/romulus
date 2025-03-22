<script lang="ts">
  import LoaderLine from '$lib/atoms/LoaderLine.svelte'
  import type { GenreStore } from '$lib/features/genres/queries/infrastructure'

  import { parser } from './parser'
  import RomcodeNode from './RomcodeNode.svelte'

  type Props = {
    data: string
    genres: Promise<GenreStore>
  }

  let { data, genres }: Props = $props()

  let root = $derived(parser(data))
</script>

{#await genres}
  <LoaderLine class="text-gray-500" />
{:then genres}
  <RomcodeNode node={root} {genres} />
{/await}

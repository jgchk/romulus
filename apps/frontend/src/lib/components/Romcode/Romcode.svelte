<script lang="ts">
  import type { GenreDatabase } from '$lib/genre-db/infrastructure/db'

  import { parser } from './parser'
  import RomcodeNode from './RomcodeNode.svelte'

  type Props = {
    data: string
    genreDatabase: GenreDatabase | undefined
  }

  let { data, genreDatabase }: Props = $props()

  let root = $derived(parser(data))
</script>

<RomcodeNode node={root} {genreDatabase} />

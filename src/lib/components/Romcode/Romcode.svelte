<script lang="ts">
  import { parser } from './parser'
  import RomcodeNode from './RomcodeNode.svelte'

  type Props = {
    data: string
    genres: { id: number; name: string; nsfw: boolean }[]
  }

  let { data, genres }: Props = $props()

  let root = $derived(parser(data))
</script>

<RomcodeNode node={root} {genres} />

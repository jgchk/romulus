<script lang="ts">
  import { parser } from './parser'
  import RomcodeNode from './RomcodeNode.svelte'

  export let data: string
  export let genres: { id: number; name: string; nsfw: boolean }[]

  $: root = parser(data)
</script>

<RomcodeNode node={root} {genres} />

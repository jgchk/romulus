<script lang="ts">
  import { parser } from './parser'
  import RomcodeNode from './RomcodeNode.svelte'

  type Props = {
    data: string
  }

  let { data }: Props = $props()

  let root = $derived(parser(data))
</script>

<RomcodeNode node={root} />

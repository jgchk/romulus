<script lang="ts">
  import Chip from '$lib/atoms/Chip.svelte'
  import { type GenreType } from '$lib/types/genres'
  import { cn } from '$lib/utils/dom'

  let class_: string | undefined = undefined
  export { class_ as class }

  export let type: GenreType

  const GenreTypeChipNames: Record<GenreType, string> = {
    MOVEMENT: 'Mvmt',
    META: 'Meta',
    STYLE: 'Style',
    TREND: 'Trend',
    SCENE: 'Scene',
  }
</script>

<Chip text={GenreTypeChipNames[type]} class={cn('genre-type-chip', class_)} />

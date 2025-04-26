<script lang="ts">
  import Chip from '$lib/atoms/Chip.svelte'
  import type { GenreType } from '$lib/types/genres'
  import { cn } from '$lib/utils/dom'

  type Props = {
    type: GenreType
    class?: string
  }

  let { type, class: class_ }: Props = $props()

  const GenreTypeChipNames: Record<GenreType, string> = {
    MOVEMENT: 'Mvmt',
    META: 'Meta',
    STYLE: 'Style',
    TREND: 'Trend',
    SCENE: 'Scene',
  }
</script>

<Chip text={GenreTypeChipNames[type]} class={cn('genre-type-chip', class_)} />

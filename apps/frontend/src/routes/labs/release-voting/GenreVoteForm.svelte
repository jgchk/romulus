<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import type { GenreStore } from '$lib/features/genres/queries/infrastructure'
  import type { TreeGenre } from '$lib/features/genres/queries/types'

  import GenreAutocomplete from './GenreAutocomplete.svelte'

  type Props = {
    id: string
    label: string
    onVote: (genre: TreeGenre) => void
    genres: GenreStore
  }

  let { id, label, onVote, genres }: Props = $props()

  let chosenGenre = $state<TreeGenre | undefined>()
</script>

<InputGroup>
  <Label for={id}>{label}</Label>
  <GenreAutocomplete {id} onSelect={(genre) => (chosenGenre = genre)} {genres} />
  {#if chosenGenre}
    {@const cg = chosenGenre}
    <Button onClick={() => onVote(cg)}>Vote</Button>
  {:else}
    <Button disabled>Vote</Button>
  {/if}
</InputGroup>

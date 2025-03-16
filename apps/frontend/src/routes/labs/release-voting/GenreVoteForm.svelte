<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import type { TreeGenre } from '../../genres/genre-tree-store.svelte'
  import GenreAutocomplete from './GenreAutocomplete.svelte'

  type Props = {
    id: string
    label: string
    onVote: (genre: TreeGenre) => void
  }

  let { id, label, onVote }: Props = $props()

  let chosenGenre = $state<TreeGenre | undefined>()
</script>

<InputGroup>
  <Label for={id}>{label}</Label>
  <GenreAutocomplete {id} onSelect={(genre) => (chosenGenre = genre)} />
  {#if chosenGenre}
    {@const cg = chosenGenre}
    <Button onClick={() => onVote(cg)}>Vote</Button>
  {:else}
    <Button disabled>Vote</Button>
  {/if}
</InputGroup>

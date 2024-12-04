<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import GenreAutocomplete from './GenreAutocomplete.svelte'
  import type { Genre } from './types'

  type Props = {
    genres: Genre[]
    id: string
    label: string
    onVote: (genre: Genre) => void
  }

  let { genres, id, label, onVote }: Props = $props()

  let chosenGenre = $state<Genre | undefined>()
</script>

<InputGroup>
  <Label for={id}>{label}</Label>
  <GenreAutocomplete {id} {genres} onSelect={(genre) => (chosenGenre = genre)} />
  {#if chosenGenre}
    {@const cg = chosenGenre}
    <Button onClick={() => onVote(cg)}>Vote</Button>
  {:else}
    <Button disabled>Vote</Button>
  {/if}
</InputGroup>

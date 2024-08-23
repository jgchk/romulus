<script lang="ts">
  import { Plus, Trash } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import ArtistMultiselect from './ArtistMultiselect.svelte'

  let artists: number[] = []
  let tracks: { title: string; artists: number[] }[] = [{ title: '', artists: [] }]
</script>

<Card class="h-full w-full p-4">
  <form method="POST">
    <InputGroup>
      <Label for="title">Title</Label>
      <Input type="text" id="title" name="title" />
    </InputGroup>

    <InputGroup>
      <Label for="artists">Artists</Label>
      <ArtistMultiselect bind:value={artists} />
    </InputGroup>

    <h2 class="text-lg font-bold">Tracks</h2>
    {#each tracks as track, i}
      <div class="flex items-center rounded-lg border p-4 dark:border-gray-800">
        <div class="flex-1">
          <InputGroup>
            <Label for="tracks[{i}].title">Title</Label>
            <Input type="text" id="tracks[{i}].title" bind:value={track.title} />
          </InputGroup>

          <InputGroup>
            <Label for="tracks[{i}].artists">Artists</Label>
            <ArtistMultiselect bind:value={track.artists} />
          </InputGroup>
        </div>
        <IconButton
          tooltip="Remove track"
          on:click={() => (tracks = tracks.filter((_, j) => j !== i))}><Trash /></IconButton
        >
      </div>
    {/each}
    <IconButton
      tooltip="Add track"
      on:click={() => (tracks = [...tracks, { title: '', artists: [] }])}><Plus /></IconButton
    >
  </form>
</Card>

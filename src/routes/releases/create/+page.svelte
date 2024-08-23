<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import ArtistMultiselect from './ArtistMultiselect.svelte'

  let artists: number[] = []
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
  </form>
</Card>

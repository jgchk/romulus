<script lang="ts">
  import { Plus, Trash } from 'phosphor-svelte'
  import { superForm } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import NumberInput from '$lib/atoms/NumberInput.svelte'

  import type { PageData } from './$types'
  import ArtistMultiselect from './ArtistMultiselect.svelte'

  export let data: PageData

  const { form, errors, constraints, delayed, enhance } = superForm(data.form, {
    dataType: 'json',
    taintedMessage: true,
  })
</script>

<Card class="h-full w-full p-4">
  <form method="POST" use:enhance>
    <InputGroup errors={$errors.title}>
      <Label for="title">Title</Label>
      <Input id="title" bind:value={$form.title} {...$constraints.title} />
    </InputGroup>

    <InputGroup errors={$errors.artists?._errors}>
      <Label for="artists">Artists</Label>
      <ArtistMultiselect bind:value={$form.artists} />
    </InputGroup>

    <InputGroup errors={$errors.art}>
      <Label for="art">Art</Label>
      <Input id="art" bind:value={$form.art} {...$constraints.art} />
    </InputGroup>

    <InputGroup errors={$errors.year ?? $errors.month ?? $errors.day}>
      <Label for="releaseDate">Release Date</Label>
      <div class="flex space-x-2">
        <NumberInput
          id="releaseDate.year"
          bind:value={$form.year}
          placeholder="YYYY"
          class="w-1/4"
          {...$constraints.year}
        />
        <NumberInput
          id="releaseDate.month"
          bind:value={$form.month}
          placeholder="MM"
          class="w-1/4"
          {...$constraints.month}
        />
        <NumberInput
          id="releaseDate.day"
          bind:value={$form.day}
          placeholder="DD"
          class="w-1/4"
          {...$constraints.day}
        />
      </div>
    </InputGroup>

    <h2 class="text-lg font-bold">Tracks</h2>
    {#each $form.tracks as track, i}
      <div class="flex items-center rounded-lg border p-4 dark:border-gray-800">
        <div class="flex-1">
          <InputGroup>
            <Label for="tracks[{i}].title">Title</Label>
            <Input
              type="text"
              id="tracks[{i}].title"
              bind:value={track.title}
              {...$constraints.tracks?.title}
            />
          </InputGroup>

          <InputGroup>
            <Label for="tracks[{i}].artists">Artists</Label>
            <ArtistMultiselect bind:value={track.artists} />
          </InputGroup>
        </div>
        <IconButton
          tooltip="Remove track"
          on:click={() => ($form.tracks = $form.tracks.filter((_, j) => j !== i))}
          ><Trash /></IconButton
        >
      </div>
    {/each}
    <IconButton
      tooltip="Add track"
      on:click={() => ($form.tracks = [...$form.tracks, { title: '', artists: [] }])}
      ><Plus /></IconButton
    >

    <Button type="submit" loading={$delayed}>Create</Button>
  </form>
</Card>

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

  import ArtistMultiselect from '../../../ArtistMultiselect.svelte'
  import TrackAutocomplete from '../../../TrackAutocomplete.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  const { form, errors, constraints, delayed, enhance } = superForm(data.form, {
    dataType: 'json',
    taintedMessage: true,
  })

  function convertToString(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    if (hours === 0) {
      return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
    }
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }
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
        {#if 'id' in track}
          <div>
            <InputGroup errors={$errors.tracks?.[i].title ?? $errors.tracks?.[i].id}>
              <Label for="tracks[{i}].title">Title</Label>
              <TrackAutocomplete
                id="tracks[{i}].title"
                bind:value={track.data.title}
                on:select={({ detail: { track } }) => {
                  $form.tracks[i] = {
                    id: track.id,
                    data: {
                      ...track,
                      duration:
                        track.durationMs !== undefined ? convertToString(track.durationMs) : '',
                    },
                    overrides: {},
                  }
                }}
              />
            </InputGroup>

            <InputGroup errors={$errors.tracks?.[i].artists?._errors}>
              <Label for="tracks[{i}].artists">Artists</Label>
              <ArtistMultiselect bind:value={track.data.artists} disabled />
            </InputGroup>

            <InputGroup errors={$errors.tracks?.[i].duration}>
              <Label for="tracks[{i}].duration">Duration</Label>
              <Input
                id="tracks[{i}].duration"
                bind:value={track.data.duration}
                disabled
                {...$constraints.tracks?.duration}
              />
            </InputGroup>
          </div>
        {:else}
          <InputGroup errors={$errors.tracks?.[i].title}>
            <Label for="tracks[{i}].title">Title</Label>
            <TrackAutocomplete
              id="tracks[{i}].title"
              bind:value={track.title}
              on:select={({ detail: { track } }) => {
                $form.tracks[i] = {
                  id: track.id,
                  data: {
                    ...track,
                    duration:
                      track.durationMs !== undefined ? convertToString(track.durationMs) : '',
                  },
                  overrides: {},
                }
              }}
            />
          </InputGroup>

          <InputGroup errors={$errors.tracks?.[i].artists?._errors}>
            <Label for="tracks[{i}].artists">Artists</Label>
            <ArtistMultiselect bind:value={track.artists} />
          </InputGroup>

          <InputGroup errors={$errors.tracks?.[i].duration}>
            <Label for="tracks[{i}].duration">Duration</Label>
            <Input
              id="tracks[{i}].duration"
              bind:value={track.duration}
              {...$constraints.tracks?.duration}
            />
          </InputGroup>
        {/if}
        <IconButton
          tooltip="Remove track"
          onClick={() => ($form.tracks = $form.tracks.filter((_, j) => j !== i))}
          ><Trash /></IconButton
        >
      </div>
    {/each}
    <IconButton
      tooltip="Add track"
      onClick={() => ($form.tracks = [...$form.tracks, { title: '', artists: [], duration: '' }])}
      ><Plus /></IconButton
    >

    <Button type="submit" loading={$delayed}>Create</Button>
  </form>
</Card>

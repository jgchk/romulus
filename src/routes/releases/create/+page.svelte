<script lang="ts">
  import { Plus, Trash } from 'phosphor-svelte'

  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import Chip from '$lib/atoms/Chip.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import NumberInput from '$lib/atoms/NumberInput.svelte'

  import ArtistMultiselect from '../ArtistMultiselect.svelte'
  import MonthSelect from '../MonthSelect.svelte'
  import TrackAutocomplete from '../TrackAutocomplete.svelte'
  import type { ActionData, PageData } from './$types'
  import { ReleaseFormStore } from './state'

  type Props = {
    data: PageData
    form: ActionData
  }

  let { data, form }: Props = $props()

  const store = new ReleaseFormStore(data.initialState)

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
  <form
    method="POST"
    use:enhance={({ formData }) => {
      formData.set('data', JSON.stringify(store.toServerInput()))
    }}
  >
    <InputGroup errors={form?.errors.title}>
      <Label for="title">Title</Label>
      <Input
        id="title"
        value={$store.title}
        onInput={(e) => store.setTitle(e.currentTarget.value)}
      />
    </InputGroup>

    <InputGroup errors={form?.errors.artists}>
      <Label for="artists">Artists</Label>
      <ArtistMultiselect
        value={$store.artists}
        on:change={(e) => store.setArtists(e.detail.value)}
      />
    </InputGroup>

    <InputGroup errors={form?.errors.art}>
      <Label for="art">Art</Label>
      <Input
        id="art"
        value={$store.art ?? ''}
        onInput={(e) => store.setArt(e.currentTarget.value)}
      />
    </InputGroup>

    <InputGroup errors={form?.errors.year ?? form?.errors.month ?? form?.errors.day}>
      <Label for="releaseDate">Release Date</Label>
      <div class="flex space-x-2">
        <NumberInput
          id="releaseDate.year"
          value={$store.year}
          onInput={(value) => store.setYear(value)}
          placeholder="YYYY"
          class="w-1/4"
        />
        <MonthSelect
          id="releaseDate.month"
          value={$store.month}
          on:input={(e) => store.setMonth(e.detail)}
          placeholder="MM"
          class="w-32"
        />
        <NumberInput
          id="releaseDate.day"
          value={$store.day}
          onInput={(value) => store.setDay(value)}
          placeholder="DD"
          class="w-1/4"
        />
      </div>
    </InputGroup>

    <h2 class="mb-1 mt-4 text-lg font-bold">Tracks</h2>
    <div class="space-y-2">
      {#each $store.tracks as track, i}
        <div class="rounded-lg border p-4 dark:border-gray-800">
          <div class="flex flex-wrap items-start gap-2">
            {#if 'id' in track}
              <InputGroup errors={form?.errors.tracks?.[i]?.title ?? form?.errors.tracks?.[i]?.id}>
                <Label for="tracks[{i}].title">Title</Label>
                <TrackAutocomplete
                  id="tracks[{i}].title"
                  value={track.data.title}
                  on:input={(e) => store.track(i).setTitle(e.detail.value)}
                  on:select={({ detail: { track } }) =>
                    store.track(i).useExistingTrack(track.id, {
                      title: track.title,
                      artists: track.artists,
                      duration:
                        track.durationMs !== undefined ? convertToString(track.durationMs) : '',
                    })}
                />
              </InputGroup>

              <InputGroup errors={form?.errors.tracks?.[i]?.artists}>
                <Label for="tracks[{i}].artists">Artists</Label>
                <ArtistMultiselect
                  value={track.data.artists}
                  on:change={(e) => store.track(i).setArtists(e.detail.value)}
                />
              </InputGroup>

              <InputGroup errors={form?.errors.tracks?.[i]?.duration}>
                <Label for="tracks[{i}].duration">Duration</Label>
                <Input
                  id="tracks[{i}].duration"
                  class="w-24"
                  value={track.data.duration}
                  onInput={(e) => store.track(i).setDuration(e.currentTarget.value)}
                />
              </InputGroup>
            {:else}
              <InputGroup errors={form?.errors.tracks?.[i]?.title}>
                <Label for="tracks[{i}].title">Title</Label>
                <TrackAutocomplete
                  id="tracks[{i}].title"
                  value={track.title}
                  autofocus
                  on:input={(e) => store.track(i).setTitle(e.detail.value)}
                  on:select={({ detail: { track } }) =>
                    store.track(i).useExistingTrack(track.id, {
                      title: track.title,
                      artists: track.artists,
                      duration:
                        track.durationMs !== undefined ? convertToString(track.durationMs) : '',
                    })}
                />
              </InputGroup>

              <InputGroup errors={form?.errors.tracks?.[i]?.artists}>
                <Label for="tracks[{i}].artists">Artists</Label>
                <ArtistMultiselect
                  value={track.artists}
                  on:change={(e) => store.track(i).setArtists(e.detail.value)}
                />
              </InputGroup>

              <InputGroup errors={form?.errors.tracks?.[i]?.duration}>
                <Label for="tracks[{i}].duration">Duration</Label>
                <Input
                  id="tracks[{i}].duration"
                  class="w-24"
                  value={track.duration}
                  onInput={(e) => store.track(i).setDuration(e.currentTarget.value)}
                />
              </InputGroup>
            {/if}

            <IconButton tooltip="Remove track" onClick={() => store.track(i).remove()}>
              <Trash />
            </IconButton>
          </div>

          {#if 'id' in track}
            <Chip class="dark:bg-primary-800 dark:text-primary-200" text="Existing" />
          {:else}
            <Chip class="dark:bg-secondary-800 dark:text-secondary-200" text="New" />
          {/if}
        </div>
      {/each}

      <IconButton tooltip="Add track" onClick={() => store.addTrack()}>
        <Plus />
      </IconButton>
    </div>

    <Button type="submit" class="mt-4">Create</Button>
  </form>
</Card>

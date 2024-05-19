<script lang="ts">
  import { superForm } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import RomcodeEditor from '$lib/components/Romcode/RomcodeEditor/RomcodeEditor.svelte'

  import type { PageData } from './$types'
  import GenreMultiselect from './GenreMultiselect.svelte'
  import GenreTypeSelect from './GenreTypeSelect.svelte'

  export let data: PageData

  const { form, errors, constraints, delayed, enhance } = superForm(data.form)
</script>

<form method="POST" use:enhance class="flex h-full flex-col">
  <div class="flex-1 space-y-3 overflow-auto p-4">
    <InputGroup errors={$errors.name}>
      <Label for="name">Name</Label>
      <Input
        id="name"
        name="name"
        bind:value={$form.name}
        autofocus={data.autoFocus === 'name'}
        {...$constraints.name}
      />
    </InputGroup>

    <InputGroup errors={$errors.subtitle}>
      <Label for="subtitle">Subtitle</Label>
      <Input
        id="subtitle"
        name="subtitle"
        value={$form.subtitle ?? ''}
        on:input={(e) => ($form.subtitle = e.currentTarget.value)}
        autofocus={data.autoFocus === 'subtitle'}
        {...$constraints.subtitle}
      />
    </InputGroup>

    <fieldset
      class="rounded border border-solid border-gray-200 p-3 transition dark:border-gray-800"
    >
      <legend class="text-sm text-gray-700 transition dark:text-gray-300">
        AKAs{' '}
        <a
          href="https://discord.com/channels/940459362168746055/1008898978911375384/1008927823647473747"
          target="_blank"
          rel="noreferrer"
          class="text-xs text-primary-500 hover:underline"
        >
          (More Info)
        </a>
      </legend>

      <div class="w-full space-y-2">
        <InputGroup errors={$errors.primaryAkas}>
          <Label for="primary-akas">Primary</Label>
          <Input
            id="primary-akas"
            name="primary-akas"
            value={$form.primaryAkas ?? ''}
            on:input={(e) => ($form.primaryAkas = e.currentTarget.value)}
            autofocus={data.autoFocus === 'primaryAkas'}
            {...$constraints.primaryAkas}
          />
        </InputGroup>
        <InputGroup errors={$errors.secondaryAkas}>
          <Label for="secondary-akas">Secondary</Label>
          <Input
            id="secondary-akas"
            name="secondary-akas"
            value={$form.secondaryAkas ?? ''}
            on:input={(e) => ($form.secondaryAkas = e.currentTarget.value)}
            autofocus={data.autoFocus === 'secondaryAkas'}
            {...$constraints.secondaryAkas}
          />
        </InputGroup>
        <InputGroup errors={$errors.tertiaryAkas}>
          <Label for="tertiary-akas">Tertiary</Label>
          <Input
            id="tertiary-akas"
            name="tertiary-akas"
            value={$form.tertiaryAkas ?? ''}
            on:input={(e) => ($form.tertiaryAkas = e.currentTarget.value)}
            autofocus={data.autoFocus === 'tertiaryAkas'}
            {...$constraints.tertiaryAkas}
          />
        </InputGroup>
      </div>
    </fieldset>

    <InputGroup errors={$errors.type}>
      <Label for="type">Type</Label>
      <GenreTypeSelect id="type" bind:value={$form.type} />
    </InputGroup>

    <InputGroup errors={$errors.parents?._errors}>
      <Label for="parents">Parents</Label>
      {#await data.streamed.genres}
        <GenreMultiselect id="parents" value={[]} genres={[]} disabled />
      {:then genres}
        <GenreMultiselect id="parents" bind:value={$form.parents} {genres} />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.influencedBy?._errors}>
      <Label for="influences">Influences</Label>
      {#await data.streamed.genres}
        <GenreMultiselect id="influences" value={[]} genres={[]} disabled />
      {:then genres}
        <GenreMultiselect
          id="influences"
          bind:value={$form.influencedBy}
          {genres}
          {...$constraints.influencedBy}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.shortDescription}>
      <Label for="short-description">Short Description</Label>
      {#await data.streamed.genres}
        <RomcodeEditor
          class="w-full"
          id="short-description"
          value={$form.shortDescription ?? ''}
          on:change={(e) => ($form.shortDescription = e.detail)}
          genres={[]}
          disabled
        />
      {:then genres}
        <RomcodeEditor
          class="w-full"
          id="short-description"
          value={$form.shortDescription ?? ''}
          on:change={(e) => ($form.shortDescription = e.detail)}
          {genres}
          autofocus={data.autoFocus === 'shortDescription'}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.longDescription}>
      <Label for="long-description">Long Description</Label>
      {#await data.streamed.genres}
        <RomcodeEditor
          class="w-full"
          id="long-description"
          value={$form.longDescription ?? ''}
          on:change={(e) => ($form.longDescription = e.detail)}
          genres={[]}
          disabled
        />
      {:then genres}
        <RomcodeEditor
          class="w-full"
          id="long-description"
          value={$form.longDescription ?? ''}
          on:change={(e) => ($form.longDescription = e.detail)}
          {genres}
          autofocus={data.autoFocus === 'longDescription'}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.notes}>
      <Label for="notes">Notes</Label>
      {#await data.streamed.genres}
        <RomcodeEditor
          class="w-full"
          id="notes"
          value={$form.notes ?? ''}
          on:change={(e) => ($form.notes = e.detail)}
          genres={[]}
          disabled
        />
      {:then genres}
        <RomcodeEditor
          class="w-full"
          id="notes"
          value={$form.notes ?? ''}
          on:change={(e) => ($form.notes = e.detail)}
          {genres}
          autofocus={data.autoFocus === 'notes'}
        />
      {/await}
    </InputGroup>
  </div>

  <div class="flex gap-1 border-t border-gray-800 p-1.5">
    <Button type="submit" loading={$delayed}>Save</Button>
    <LinkButton kind="text" href="/genres/{data.id}">Cancel</LinkButton>
  </div>
</form>

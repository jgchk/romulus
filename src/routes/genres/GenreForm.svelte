<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import Checkbox from '$lib/atoms/Checkbox.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import HelpTip from '$lib/atoms/HelpTip.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import { toast } from '$lib/atoms/Toast/toast'
  import RomcodeEditor from '$lib/components/Romcode/RomcodeEditor/RomcodeEditor.svelte'
  import type { GenreSchema } from '$lib/server/db/utils'

  import Footer from './Footer.svelte'
  import type { GenreFormField } from './GenreForm'
  import GenreMultiselect from './GenreMultiselect.svelte'
  import type { TreeGenre } from './GenreNavigator/GenreTree/state'
  import GenreTypeSelect from './GenreTypeSelect.svelte'
  import RelevanceSelect from './RelevanceSelect.svelte'

  export let id: number | undefined = undefined
  export let data: SuperValidated<Infer<GenreSchema>>
  export let autoFocus: GenreFormField = 'name'
  export let showRelevance = false
  export let genres: Promise<TreeGenre[]>

  let topLevelConfirmation: 'confirm' | 'confirmed' | undefined = undefined

  const dispatch = createEventDispatcher<{ submit: undefined }>()

  const { form, errors, constraints, delayed, enhance, submit } = superForm(data, {
    dataType: 'json',
    taintedMessage: true,

    onSubmit: ({ cancel }) => {
      if ($form.parents.length === 0 && topLevelConfirmation !== 'confirmed') {
        topLevelConfirmation = 'confirm'
        cancel()
        return
      }

      dispatch('submit')
    },

    onUpdated: ({ form }) => {
      if (!form.valid) {
        toast.error('The form has errors. Please correct them before submitting.')
      }
    },
  })
</script>

<form method="POST" use:enhance class="flex h-full flex-col">
  <div class="flex-1 space-y-3 overflow-auto p-4">
    <InputGroup errors={$errors.name}>
      <Label for="name">Name</Label>
      <Input
        id="name"
        name="name"
        class="w-full"
        bind:value={$form.name}
        autofocus={autoFocus === 'name'}
        {...$constraints.name}
      />
    </InputGroup>

    <InputGroup errors={$errors.subtitle}>
      <Label for="subtitle">Subtitle</Label>
      <Input
        id="subtitle"
        name="subtitle"
        class="w-full"
        value={$form.subtitle ?? ''}
        on:input={(e) => ($form.subtitle = e.currentTarget.value)}
        autofocus={autoFocus === 'subtitle'}
        {...$constraints.subtitle}
      />
    </InputGroup>

    <fieldset
      class="rounded border border-solid border-gray-200 p-3 pt-2 transition dark:border-gray-800"
    >
      <legend class="text-sm text-gray-600 transition dark:text-gray-400"> AKAs </legend>

      <div class="w-full space-y-2">
        <InputGroup errors={$errors.primaryAkas}>
          <div>
            <Label for="primary-akas">Primary</Label>
            <HelpTip tooltip="Used about as much as the main genre name itself." />
          </div>
          <Input
            id="primary-akas"
            name="primary-akas"
            class="w-full"
            value={$form.primaryAkas ?? ''}
            on:input={(e) => ($form.primaryAkas = e.currentTarget.value)}
            autofocus={autoFocus === 'primaryAkas'}
            {...$constraints.primaryAkas}
          />
        </InputGroup>
        <InputGroup errors={$errors.secondaryAkas}>
          <div>
            <Label for="secondary-akas">Secondary</Label>
            <HelpTip
              tooltip="Used less than the main genre name, but most people familiar with the genre will still know what it refers to."
            />
          </div>
          <Input
            id="secondary-akas"
            name="secondary-akas"
            class="w-full"
            value={$form.secondaryAkas ?? ''}
            on:input={(e) => ($form.secondaryAkas = e.currentTarget.value)}
            autofocus={autoFocus === 'secondaryAkas'}
            {...$constraints.secondaryAkas}
          />
        </InputGroup>
        <InputGroup errors={$errors.tertiaryAkas}>
          <div>
            <Label for="tertiary-akas">Tertiary</Label>
            <HelpTip
              tooltip="Rarely used. Many people familiar with the genre will not know what it refers to."
            />
          </div>
          <Input
            id="tertiary-akas"
            name="tertiary-akas"
            class="w-full"
            value={$form.tertiaryAkas ?? ''}
            on:input={(e) => ($form.tertiaryAkas = e.currentTarget.value)}
            autofocus={autoFocus === 'tertiaryAkas'}
            {...$constraints.tertiaryAkas}
          />
        </InputGroup>
      </div>
    </fieldset>

    <InputGroup errors={$errors.type}>
      <Label for="type">Type</Label>
      <GenreTypeSelect id="type" class="w-full" bind:value={$form.type} />
    </InputGroup>

    <InputGroup errors={$errors.parents?._errors}>
      <Label for="parents">Parents</Label>
      {#await genres}
        <GenreMultiselect
          id="parents"
          class="genre-parents w-full"
          value={[]}
          exclude={id !== undefined ? [id] : []}
          genres={[]}
          disabled
          {...$constraints.parents}
        />
      {:then genres}
        <GenreMultiselect
          id="parents"
          class="genre-parents w-full"
          bind:value={$form.parents}
          exclude={id !== undefined ? [id] : []}
          {genres}
          {...$constraints.parents}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.influencedBy?._errors}>
      <Label for="influences">Influences</Label>
      {#await genres}
        <GenreMultiselect
          id="influences"
          class="genre-influences w-full"
          value={[]}
          exclude={id !== undefined ? [id] : []}
          genres={[]}
          disabled
          {...$constraints.influencedBy}
        />
      {:then genres}
        <GenreMultiselect
          id="influences"
          class="genre-influences w-full"
          bind:value={$form.influencedBy}
          exclude={id !== undefined ? [id] : []}
          {genres}
          {...$constraints.influencedBy}
        />
      {/await}
    </InputGroup>

    {#if showRelevance}
      <InputGroup errors={$errors.relevance}>
        <Label for="relevance">Relevance</Label>
        <RelevanceSelect
          id="relevance"
          class="genre-relevances w-full"
          bind:value={$form.relevance}
        />
      </InputGroup>
    {/if}

    <InputGroup errors={$errors.nsfw} layout="horizontal">
      <Checkbox id="nsfw" bind:checked={$form.nsfw} />
      <Label for="nsfw">NSFW</Label>
    </InputGroup>

    <InputGroup errors={$errors.shortDescription}>
      <Label for="short-description">Short Description</Label>
      {#await genres}
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
          autofocus={autoFocus === 'shortDescription'}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.longDescription}>
      <Label for="long-description">Long Description</Label>
      {#await genres}
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
          autofocus={autoFocus === 'longDescription'}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.notes}>
      <Label for="notes">Notes</Label>
      {#await genres}
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
          autofocus={autoFocus === 'notes'}
        />
      {/await}
    </InputGroup>
  </div>

  <Footer>
    <Button type="submit" loading={$delayed}>Save</Button>
    <LinkButton kind="text" href={id !== undefined ? `/genres/${id}` : '/genres'}>
      Cancel
    </LinkButton>
  </Footer>
</form>

{#if topLevelConfirmation === 'confirm'}
  <Dialog role="alertdialog" title="Submit top level genre?">
    You are submitting a top level genre. Are you sure you want to continue?

    <svelte:fragment slot="buttons">
      <Button
        on:click={() => {
          topLevelConfirmation = 'confirmed'
          submit()
        }}
      >
        Yes
      </Button>
      <Button kind="text" on:click={() => (topLevelConfirmation = undefined)}>No</Button>
    </svelte:fragment>
  </Dialog>
{/if}

<script lang="ts">
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
  import type { GenreStore } from '$lib/features/genres/queries/infrastructure'
  import type { GenreSchema } from '$lib/server/api/genres/types'

  import Footer from './Footer.svelte'
  import type { GenreFormField } from './GenreForm'
  import GenreMultiselect from './GenreMultiselect.svelte'
  import GenreTypeSelect from './GenreTypeSelect.svelte'
  import RelevanceSelect from './RelevanceSelect.svelte'

  type Props = {
    id?: number
    data: SuperValidated<Infer<GenreSchema>>
    autoFocus?: GenreFormField
    showRelevance?: boolean
    onSubmit?: () => void
    genres: Promise<GenreStore>
  }

  let { id, data, autoFocus = 'name', showRelevance = false, onSubmit, genres }: Props = $props()

  let topLevelConfirmation: 'confirm' | 'confirmed' | undefined = $state(undefined)

  const { form, errors, constraints, delayed, enhance, submit } = superForm(data, {
    dataType: 'json',
    taintedMessage: true,

    onSubmit: ({ cancel }) => {
      if (
        $form.parents.length === 0 &&
        $form.derivedFrom.length === 0 &&
        topLevelConfirmation !== 'confirmed'
      ) {
        topLevelConfirmation = 'confirm'
        cancel()
        return
      }

      onSubmit?.()
    },

    onError: ({ result }) => {
      toast.error(result.error.message)
    },

    onUpdated: ({ form }) => {
      if (!form.valid) {
        toast.error('The form has errors. Please correct them before submitting.')
      }
    },
  })
</script>

<form method="post" use:enhance class="flex h-full flex-col">
  <div class="flex-1 space-y-3 overflow-auto p-4">
    <InputGroup errors={$errors.name}>
      <Label for="name">Name</Label>
      <Input
        id="name"
        name="name"
        class="w-full"
        bind:value={$form.name}
        onBlur={() => ($form.name = $form.name.trim())}
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
        onInput={(e) => ($form.subtitle = e.currentTarget.value)}
        onBlur={() => ($form.subtitle = $form.subtitle?.trim() ?? null)}
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
            onInput={(e) => ($form.primaryAkas = e.currentTarget.value)}
            onBlur={() => {
              $form.primaryAkas =
                $form.primaryAkas
                  ?.split(',')
                  .map((value) => value.trim())
                  .filter((value) => value !== '')
                  .join(', ') ?? null
            }}
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
            onInput={(e) => ($form.secondaryAkas = e.currentTarget.value)}
            onBlur={() => {
              $form.secondaryAkas =
                $form.secondaryAkas
                  ?.split(',')
                  .map((value) => value.trim())
                  .filter((value) => value !== '')
                  .join(', ') ?? null
            }}
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
            onInput={(e) => ($form.tertiaryAkas = e.currentTarget.value)}
            onBlur={() => {
              $form.tertiaryAkas =
                $form.tertiaryAkas
                  ?.split(',')
                  .map((value) => value.trim())
                  .filter((value) => value !== '')
                  .join(', ') ?? null
            }}
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
      {#await genres then genres}
        <GenreMultiselect
          id="parents"
          class="genre-parents w-full"
          bind:value={$form.parents}
          exclude={id !== undefined ? [id] : []}
          {...$constraints.parents}
          {genres}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.derivedFrom?._errors}>
      <Label for="derives">Derived From</Label>
      {#await genres then genres}
        <GenreMultiselect
          id="derives"
          class="genre-derives w-full"
          bind:value={$form.derivedFrom}
          exclude={id !== undefined ? [id] : []}
          {...$constraints.derivedFrom}
          {genres}
        />
      {/await}
    </InputGroup>

    <InputGroup errors={$errors.influencedBy?._errors}>
      <Label for="influences">Influences</Label>
      {#await genres then genres}
        <GenreMultiselect
          id="influences"
          class="genre-influences w-full"
          bind:value={$form.influencedBy}
          exclude={id !== undefined ? [id] : []}
          {...$constraints.influencedBy}
          {genres}
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
      <RomcodeEditor
        class="w-full"
        id="short-description"
        value={$form.shortDescription ?? ''}
        onChange={(value) => {
          const newValue = value ?? ''
          const oldValue = $form.shortDescription ?? ''
          if (newValue !== oldValue) {
            $form.shortDescription = value
          }
        }}
        autofocus={autoFocus === 'shortDescription'}
        {genres}
      />
    </InputGroup>

    <InputGroup errors={$errors.longDescription}>
      <Label for="long-description">Long Description</Label>
      <RomcodeEditor
        class="w-full"
        id="long-description"
        value={$form.longDescription ?? ''}
        onChange={(value) => {
          const newValue = value ?? ''
          const oldValue = $form.longDescription ?? ''
          if (newValue !== oldValue) {
            $form.longDescription = value
          }
        }}
        autofocus={autoFocus === 'longDescription'}
        {genres}
      />
    </InputGroup>

    <InputGroup errors={$errors.notes}>
      <Label for="notes">Notes</Label>
      <RomcodeEditor
        class="w-full"
        id="notes"
        value={$form.notes ?? ''}
        onChange={(value) => {
          const newValue = value ?? ''
          const oldValue = $form.notes ?? ''
          if (newValue !== oldValue) {
            $form.notes = value
          }
        }}
        autofocus={autoFocus === 'notes'}
        {genres}
      />
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

    {#snippet buttons()}
      <Button
        onClick={() => {
          topLevelConfirmation = 'confirmed'
          submit()
        }}
      >
        Yes
      </Button>
      <Button kind="text" onClick={() => (topLevelConfirmation = undefined)}>No</Button>
    {/snippet}
  </Dialog>
{/if}

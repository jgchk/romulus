<script lang="ts">
  import { getQueryClientContext } from '@tanstack/svelte-query'
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import { toast } from '$lib/atoms/Toast/toast'

  import Footer from '../../../../routes/genres/Footer.svelte'
  import { mediaTypeQueries } from '../state/tanstack'
  import type { MediaTypeStore } from '../state/types'
  import type { MediaArtifactTypeSchema } from './MediaArtifactTypeForm'
  import MediaTypeMultiselect from './MediaTypeMultiselect.svelte'

  type Props = {
    id?: string
    data: SuperValidated<Infer<MediaArtifactTypeSchema>>
    onSubmit?: () => void
    onSuccess?: () => void
    mediaTypes: MediaTypeStore
  }

  let { id, data, onSubmit, onSuccess, mediaTypes }: Props = $props()

  const queryClient = getQueryClientContext()
  const { form, errors, constraints, delayed, enhance } = superForm(data, {
    dataType: 'json',
    taintedMessage: true,

    onSubmit: () => {
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

    onResult: async ({ result }) => {
      if (result.type === 'success') {
        // TODO: invalid media artifact types query
        await queryClient.invalidateQueries({ queryKey: mediaTypeQueries.tree().queryKey })
        onSuccess?.()
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
        autofocus
        {...$constraints.name}
      />
    </InputGroup>

    <InputGroup errors={$errors.mediaTypes?._errors}>
      <Label for="media-types">Media Types</Label>
      <MediaTypeMultiselect
        id="media-types"
        class="media-artifact-type-media-types w-full"
        bind:value={$form.mediaTypes}
        exclude={id !== undefined ? [id] : []}
        {...$constraints.mediaTypes}
        {mediaTypes}
      />
    </InputGroup>
  </div>

  <Footer>
    <Button type="submit" loading={$delayed}>Save</Button>
    <LinkButton
      kind="text"
      href={id !== undefined ? `/media-artifact-types/${id}` : '/media-artifact-types'}
    >
      Cancel
    </LinkButton>
  </Footer>
</form>

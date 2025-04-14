<script lang="ts">
  import { getQueryClientContext } from '@tanstack/svelte-query'
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import { toast } from '$lib/atoms/Toast/toast'
  import { routes } from '$lib/routes'

  import Footer from '../../../../routes/genres/Footer.svelte'
  import { mediaTypeQueries } from '../state/tanstack'
  import type { MediaArtifactRelationshipTypeSchema } from './MediaArtifactRelationshipTypeForm'
  import MediaArtifactTypeMultiselect from './MediaArtifactTypeMultiselect.svelte'
  import MediaArtifactTypeSelect from './MediaArtifactTypeSelect.svelte'

  type Props = {
    id?: string
    data: SuperValidated<Infer<MediaArtifactRelationshipTypeSchema>>
    onSubmit?: () => void
    mediaArtifactTypes: Map<string, { id: string; name: string }>
  }

  let { data, onSubmit, mediaArtifactTypes }: Props = $props()

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

    <InputGroup errors={$errors.parentMediaArtifactType}>
      <Label for="parent-media-artifact-type">Parent Media Artifact Type</Label>
      <MediaArtifactTypeSelect
        id="parent-media-artifact-type"
        class="w-full"
        bind:value={$form.parentMediaArtifactType}
        {...$constraints.parentMediaArtifactType}
        {mediaArtifactTypes}
      />
    </InputGroup>

    <InputGroup errors={$errors.childMediaArtifactTypes?._errors}>
      <Label for="child-media-artifact-types">Child Media Artifact Types</Label>
      <MediaArtifactTypeMultiselect
        id="child-media-artifact-types"
        class="w-full"
        bind:value={$form.childMediaArtifactTypes}
        {...$constraints.childMediaArtifactTypes}
        {mediaArtifactTypes}
      />
    </InputGroup>
  </div>

  <Footer>
    <Button type="submit" loading={$delayed}>Save</Button>
    <LinkButton kind="text" href={routes.media.artifactTypes.relationships.route()}
      >Cancel</LinkButton
    >
  </Footer>
</form>

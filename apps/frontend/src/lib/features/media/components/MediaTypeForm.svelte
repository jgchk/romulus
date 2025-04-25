<script lang="ts">
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import { toast } from '$lib/atoms/Toast/toast'
  import Footer from '$lib/components/Footer.svelte'
  import { routes } from '$lib/routes'

  import { type MediaTypeSchema } from './MediaTypeForm'
  import MediaTypeMultiselect from './MediaTypeMultiselect.svelte'

  type Props = {
    id?: string
    data: SuperValidated<Infer<MediaTypeSchema>>
    onSubmit?: () => void
    mediaTypes: Map<string, { id: string; name: string }>
  }

  let { id, data, onSubmit, mediaTypes }: Props = $props()

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

    <InputGroup errors={$errors.parents?._errors}>
      <Label for="parents">Parents</Label>
      <MediaTypeMultiselect
        id="parents"
        class="media-type-parents w-full"
        bind:value={$form.parents}
        exclude={id !== undefined ? [id] : []}
        {...$constraints.parents}
        {mediaTypes}
      />
    </InputGroup>
  </div>

  <Footer>
    <Button type="submit" loading={$delayed}>Save</Button>
    <LinkButton kind="text" href={routes.media.types.route()}>Cancel</LinkButton>
  </Footer>
</form>

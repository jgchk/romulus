<script lang="ts">
  import { superForm } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import RelevanceSelect from '$lib/features/genres/components/RelevanceSelect.svelte'

  import type { PageData } from './$types'

  type Props = {
    voteForm: PageData['relevanceVoteForm']
    class?: string
    onClose?: () => void
  }

  let { voteForm, class: class_, onClose }: Props = $props()

  const { form, errors, constraints, delayed, enhance } = superForm(voteForm, {
    dataType: 'json',
    onUpdate: ({ result }) => {
      if (result.type === 'success') {
        onClose?.()
      }
    },
  })
</script>

<form method="post" action="?/relevance" use:enhance class={class_}>
  <InputGroup errors={$errors.relevanceVote}>
    <Label for="relevance-vote">Your Vote</Label>
    <div class="flex items-center gap-1">
      <RelevanceSelect
        id="relevance-vote"
        class="w-52"
        bind:value={$form.relevanceVote}
        {...$constraints.relevanceVote}
      />
      <Button kind="solid" type="submit" loading={$delayed}>Vote</Button>
      <Button kind="text" type="button" onClick={() => onClose?.()}>Cancel</Button>
    </div>
  </InputGroup>
</form>

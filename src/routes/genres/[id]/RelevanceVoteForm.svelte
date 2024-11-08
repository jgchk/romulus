<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { superForm } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import RelevanceSelect from '../RelevanceSelect.svelte'
  import type { PageData } from './$types'

  export let voteForm: PageData['relevanceVoteForm']

  let class_: string | undefined = undefined
  export { class_ as class }

  const dispatch = createEventDispatcher<{ close: undefined }>()

  const { form, errors, constraints, delayed, enhance } = superForm(voteForm, {
    dataType: 'json',
    onUpdate: ({ result }) => {
      if (result.type === 'success') {
        dispatch('close')
      }
    },
  })
</script>

<form method="POST" action="?/relevance" use:enhance class={class_}>
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
      <Button kind="text" type="button" onClick={() => dispatch('close')}>Cancel</Button>
    </div>
  </InputGroup>
</form>

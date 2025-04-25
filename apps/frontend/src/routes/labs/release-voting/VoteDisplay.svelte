<script lang="ts">
  import { Check, X } from 'phosphor-svelte'

  import Button from '$lib/atoms/Button.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'

  import { type Genre } from './types'

  type Props = {
    genre: Genre
    agree: Set<string>
    disagree: Set<string>
    onVoteFor: () => void
    onVoteAgainst: () => void
    onVoteRemove: () => void
    userHasVoted: boolean
  }

  let { genre, agree, disagree, onVoteFor, onVoteAgainst, onVoteRemove, userHasVoted }: Props =
    $props()
</script>

<div class="rounded p-2 dark:bg-gray-700">
  <div class="mb-2 font-bold uppercase tracking-widest">{genre.name}</div>
  <div class="text-sm dark:text-gray-200">Agree: {[...agree].join(', ')}</div>
  <div class="text-sm dark:text-gray-200">Disagree: {[...disagree].join(', ')}</div>
  <div class="mt-2 flex items-center">
    <IconButton tooltip="Agree" onClick={onVoteFor}>
      <Check />
    </IconButton>
    <IconButton tooltip="Disagree" onClick={onVoteAgainst}>
      <X />
    </IconButton>
    {#if userHasVoted}
      <Button kind="text" onClick={onVoteRemove}>Cancel</Button>
    {/if}
  </div>
</div>

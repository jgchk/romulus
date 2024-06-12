<script lang="ts">
  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import Romcode from '$lib/components/Romcode/Romcode.svelte'
  import { user } from '$lib/contexts/user'
  import { slide } from '$lib/transitions/slide'
  import { GenreTypeNames, getGenreRelevanceText } from '$lib/types/genres'

  import type { PageData } from './$types'
  import GenrePageHeader from './GenrePageHeader.svelte'
  import RelevanceVoteForm from './RelevanceVoteForm.svelte'
  import RelevanceVoteGraph from './RelevanceVoteGraph.svelte'

  export let data: PageData

  let isVoting = false
  let showNotes = false
  let isDeleting = false
</script>

<div class="flex h-full w-full flex-col">
  <GenrePageHeader id={data.genre.id} name={data.genre.name} subtitle={data.genre.subtitle} />

  <div class="flex-1 space-y-3 p-4">
    {#if data.genre.akas.length > 0}
      <div>
        <Label for="akas">AKA</Label>
        <div id="akas">
          {data.genre.akas.join(', ')}
        </div>
      </div>
    {/if}

    <div>
      <Label for="type">Type</Label>
      <div id="type" class="capitalize">
        {GenreTypeNames[data.genre.type]}
      </div>
    </div>

    <div>
      <Label for="relevance">
        Relevance
        {#if $user && $user.permissions?.includes('EDIT_GENRES')}
          {' '}
          <button
            class="text-xs text-primary-500 hover:underline"
            on:click={() => (isVoting = !isVoting)}
          >
            ({isVoting ? 'Cancel' : 'Vote'})
          </button>
        {/if}
      </Label>
      <div id="relevance">
        {#if data.genre.relevance === 99}
          None set.{' '}
          <button class="text-primary-500 hover:underline" on:click={() => (isVoting = true)}>
            Vote.
          </button>
        {:else}
          {data.genre.relevance} - {getGenreRelevanceText(data.genre.relevance)}
        {/if}
      </div>
      {#if isVoting}
        <div
          class="mt-1 rounded border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
          transition:slide|local={{ axis: 'y' }}
        >
          <RelevanceVoteForm
            voteForm={data.relevanceVoteForm}
            class="mt-1"
            on:close={() => (isVoting = false)}
          />
          <div class="mt-4 max-w-sm space-y-0.5">
            <Label>Results</Label>
            <RelevanceVoteGraph votes={data.relevanceVotes} />
          </div>
        </div>
      {/if}
    </div>

    {#if data.genre.parents.length > 0}
      <div>
        <Label for="parents">Parents</Label>
        <div>
          <ul id="parents" class="comma-list">
            {#each data.genre.parents as genre (genre.id)}
              <li class="block">
                <GenreLink
                  id={genre.id}
                  name={genre.name}
                  type={genre.type}
                  subtitle={genre.subtitle}
                />
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}

    {#if data.genre.influencedBy.length > 0}
      <div>
        <Label for="influences">Influences</Label>
        <div>
          <ul id="influences" class="comma-list">
            {#each data.genre.influencedBy as genre (genre.id)}
              <li class="block">
                <GenreLink
                  id={genre.id}
                  name={genre.name}
                  type={genre.type}
                  subtitle={genre.subtitle}
                />
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}

    <div>
      <Label for="short-description">Short Description</Label>
      <div id="short-description">
        {#if data.genre.shortDescription}
          {#await data.streamed.genres}
            <div class="w-[75%] space-y-2 pt-1">
              <div class="skeleton relative h-4 w-[90%] overflow-hidden rounded" />
              <div class="skeleton relative h-4 w-[100%] overflow-hidden rounded" />
              <div class="skeleton relative h-4 w-[75%] overflow-hidden rounded" />
            </div>
          {:then genres}
            <Romcode data={data.genre.shortDescription} {genres} />
          {/await}
        {:else}
          <span>
            Missing a short description.{' '}
            {#if $user && $user.permissions?.includes('EDIT_GENRES')}
              <a
                href="/genres/{data.genre.id}/edit?focus=shortDescription"
                class="text-primary-500 hover:underline"
              >
                Add one.
              </a>
            {/if}
          </span>
        {/if}
      </div>
    </div>

    <div>
      <Label for="long-description">Long Description</Label>
      <div id="long-description">
        {#if data.genre.longDescription}
          {#await data.streamed.genres}
            <div class="w-[75%] space-y-2 pt-1">
              <div class="skeleton relative h-4 w-[90%] overflow-hidden rounded" />
              <div class="skeleton relative h-4 w-[100%] overflow-hidden rounded" />
              <div class="skeleton relative h-4 w-[75%] overflow-hidden rounded" />
            </div>
          {:then genres}
            <Romcode data={data.genre.longDescription} {genres} />
          {/await}
        {:else}
          <span>
            Missing a long description.{' '}
            {#if $user && $user.permissions?.includes('EDIT_GENRES')}
              <a
                href="/genres/{data.genre.id}/edit?focus=longDescription"
                class="text-primary-500 hover:underline"
              >
                Add one.
              </a>
            {/if}
          </span>
        {/if}
      </div>
    </div>

    {#if data.genre.notes}
      <div>
        <Label for="notes">Notes</Label>
        <div id="notes">
          {#if showNotes}
            {#await data.streamed.genres}
              <div class="w-[75%] space-y-2 pt-1">
                <div class="skeleton relative h-4 w-[90%] overflow-hidden rounded" />
                <div class="skeleton relative h-4 w-[100%] overflow-hidden rounded" />
                <div class="skeleton relative h-4 w-[75%] overflow-hidden rounded" />
              </div>
            {:then genres}
              <div transition:slide|local={{ axis: 'y' }}>
                <Romcode data={data.genre.notes} {genres} />
              </div>
            {/await}
          {/if}
          <button
            type="button"
            class="text-primary-500 hover:underline"
            on:click={() => (showNotes = !showNotes)}
          >
            {#if showNotes}Hide{:else}Show{/if} notes
          </button>
        </div>
      </div>
    {/if}
  </div>

  <div class="flex gap-1 border-t border-gray-200 p-1 dark:border-gray-800">
    <LinkButton href="/genres/{data.id}/edit">Edit</LinkButton>
    <LinkButton kind="outline" href="/genres/{data.id}/history">History</LinkButton>
    <div class="flex-1" />
    {#if $user && $user.permissions?.includes('EDIT_GENRES')}
      <Button kind="text" color="error" on:click={() => (isDeleting = true)}>Delete</Button>
    {/if}
  </div>
</div>

{#if isDeleting}
  <Dialog title="Delete {data.genre.name}?" on:close={() => (isDeleting = false)}>
    <svelte:fragment slot="buttons">
      <form method="POST" action="?/delete" use:enhance>
        <Button kind="solid" color="error" type="submit">Delete</Button>
      </form>
      <Button kind="text" on:click={() => (isDeleting = false)}>Cancel</Button>
    </svelte:fragment>
  </Dialog>
{/if}

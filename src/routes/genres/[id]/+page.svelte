<script lang="ts">
  import { fade } from 'svelte/transition'

  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import CommaList from '$lib/atoms/CommaList.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import AccountLink from '$lib/components/AccountLink.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import Romcode from '$lib/components/Romcode/Romcode.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { slide } from '$lib/transitions/slide'
  import { GenreTypeNames, getGenreRelevanceText, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
  import { cn } from '$lib/utils/dom'
  import { genreTitle, pageTitle } from '$lib/utils/string'

  import Footer from '../Footer.svelte'
  import type { PageData } from './$types'
  import GenrePageHeader from './GenrePageHeader.svelte'
  import RelevanceVoteForm from './RelevanceVoteForm.svelte'
  import RelevanceVoteGraph from './RelevanceVoteGraph.svelte'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  let isVoting = $state(false)
  let showNotes = $state(false)
  let isDeleting = $state(false)
  let isDeleteLoading = $state(false)

  const user = getUserContext()
  const userSettings = getUserSettingsContext()
</script>

<svelte:head>
  <title>{pageTitle(genreTitle(data.genre.name, data.genre.subtitle), 'Genres')}</title>
</svelte:head>

<div class="relative h-full w-full">
  {#if data.genre.nsfw && !$userSettings.showNsfw}
    <div
      class="absolute flex h-full w-full items-center justify-center p-4 text-center font-semibold shadow-sm"
      transition:fade={{ duration: 75 }}
    >
      Enable NSFW genres in settings to view this genre
    </div>
  {/if}

  <div
    data-testid="genre-page"
    class={cn(
      'flex h-full w-full flex-col transition',
      data.genre.nsfw && !$userSettings.showNsfw && 'blur',
    )}
  >
    <GenrePageHeader
      id={data.genre.id}
      name={data.genre.name}
      subtitle={data.genre.subtitle}
      nsfw={data.genre.nsfw}
    />

    <div class="flex-1 space-y-3 overflow-auto p-4">
      {#if data.genre.akas.length > 0}
        <div>
          <Label>AKA</Label>
          <div class="genre-akas">
            {data.genre.akas.join(', ')}
          </div>
        </div>
      {/if}

      <div>
        <Label>Type</Label>
        <div class="genre-type capitalize">
          {GenreTypeNames[data.genre.type]}
        </div>
      </div>

      <div>
        <div>
          <Label>Relevance</Label>
          {#if $user?.permissions?.includes('EDIT_GENRES')}
            {' '}
            <button
              type="button"
              class="text-xs text-primary-500 hover:underline"
              onclick={() => (isVoting = !isVoting)}
            >
              ({isVoting ? 'Cancel' : 'Vote'})
            </button>
          {/if}
        </div>
        <div class="genre-relevance">
          {#if data.genre.relevance === UNSET_GENRE_RELEVANCE}
            None set.{' '}
            <button
              type="button"
              class="text-primary-500 hover:underline"
              onclick={() => (isVoting = true)}
            >
              Vote.
            </button>
          {:else}
            {data.genre.relevance} - {getGenreRelevanceText(data.genre.relevance)}
          {/if}
        </div>
        {#if isVoting}
          <div
            class="mt-1 rounded border border-gray-300 bg-gray-50 p-4 transition dark:border-gray-700 dark:bg-gray-900"
            transition:slide|local={{ axis: 'y' }}
          >
            <RelevanceVoteForm
              voteForm={data.relevanceVoteForm}
              class="mt-1"
              onClose={() => (isVoting = false)}
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
          <Label>Parents</Label>
          <div class="genre-parents">
            <CommaList
              items={data.genre.parents}
              class="text-gray-600 transition dark:text-gray-400"
            >
              {#snippet children({ item: genre })}
                <GenreLink
                  id={genre.id}
                  name={genre.name}
                  type={genre.type}
                  subtitle={genre.subtitle}
                  nsfw={genre.nsfw}
                />
              {/snippet}
            </CommaList>
          </div>
        </div>
      {/if}

      {#if data.genre.derivedFrom.length > 0}
        <div>
          <Label>Derives</Label>
          <div class="genre-derives">
            <CommaList
              items={data.genre.derivedFrom}
              class="text-gray-600 transition dark:text-gray-400"
            >
              {#snippet children({ item: genre })}
                <GenreLink
                  id={genre.id}
                  name={genre.name}
                  type={genre.type}
                  subtitle={genre.subtitle}
                  nsfw={genre.nsfw}
                />
              {/snippet}
            </CommaList>
          </div>
        </div>
      {/if}

      {#if data.genre.influencedBy.length > 0}
        <div>
          <Label>Influences</Label>
          <div class="genre-influences">
            <CommaList
              items={data.genre.influencedBy}
              class="text-gray-600 transition dark:text-gray-400"
            >
              {#snippet children({ item: genre })}
                <GenreLink
                  id={genre.id}
                  name={genre.name}
                  type={genre.type}
                  subtitle={genre.subtitle}
                  nsfw={genre.nsfw}
                />
              {/snippet}
            </CommaList>
          </div>
        </div>
      {/if}

      {#if data.genre.influences.length > 0}
        <div>
          <Label>Influenced</Label>
          <div class="genre-influenced">
            <CommaList
              items={data.genre.influences}
              class="text-gray-600 transition dark:text-gray-400"
            >
              {#snippet children({ item: genre })}
                <GenreLink
                  id={genre.id}
                  name={genre.name}
                  type={genre.type}
                  subtitle={genre.subtitle}
                  nsfw={genre.nsfw}
                />
              {/snippet}
            </CommaList>
          </div>
        </div>
      {/if}

      <div>
        <Label>Short Description</Label>
        <div class="genre-short-description">
          {#if data.genre.shortDescription}
            {#await data.streamed.genres}
              <div class="w-[75%] space-y-2 pt-1">
                <div class="skeleton relative h-4 w-[90%] overflow-hidden rounded"></div>
                <div class="skeleton relative h-4 w-[100%] overflow-hidden rounded"></div>
                <div class="skeleton relative h-4 w-[75%] overflow-hidden rounded"></div>
              </div>
            {:then genres}
              <Romcode data={data.genre.shortDescription} {genres} />
            {/await}
          {:else}
            <span>
              Missing a short description.{' '}
              {#if $user?.permissions?.includes('EDIT_GENRES')}
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
        <Label>Long Description</Label>
        <div class="genre-long-description">
          {#if data.genre.longDescription}
            {#await data.streamed.genres}
              <div class="w-[75%] space-y-2 pt-1">
                <div class="skeleton relative h-4 w-[90%] overflow-hidden rounded"></div>
                <div class="skeleton relative h-4 w-[100%] overflow-hidden rounded"></div>
                <div class="skeleton relative h-4 w-[75%] overflow-hidden rounded"></div>
              </div>
            {:then genres}
              <Romcode data={data.genre.longDescription} {genres} />
            {/await}
          {:else}
            <span>
              Missing a long description.{' '}
              {#if $user?.permissions?.includes('EDIT_GENRES')}
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
          <Label>Notes</Label>
          <div>
            {#if showNotes}
              {#await data.streamed.genres}
                <div class="w-[75%] space-y-2 pt-1">
                  <div class="skeleton relative h-4 w-[90%] overflow-hidden rounded"></div>
                  <div class="skeleton relative h-4 w-[100%] overflow-hidden rounded"></div>
                  <div class="skeleton relative h-4 w-[75%] overflow-hidden rounded"></div>
                </div>
              {:then genres}
                <div class="genre-notes" transition:slide|local={{ axis: 'y' }}>
                  <Romcode data={data.genre.notes} {genres} />
                </div>
              {/await}
            {/if}
            <button
              type="button"
              class="text-primary-500 hover:underline"
              onclick={() => (showNotes = !showNotes)}
            >
              {#if showNotes}Hide{:else}Show{/if} notes
            </button>
          </div>
        </div>
      {/if}

      {#if data.genre.contributors.length}
        <div>
          <Label>Contributors</Label>
          <div class="genre-contributors">
            <CommaList
              items={data.genre.contributors}
              class="text-gray-600 transition dark:text-gray-400"
            >
              {#snippet children({ item })}
                <AccountLink accountId={item.id} username={item.username} />
              {/snippet}
            </CommaList>
          </div>
        </div>
      {/if}
    </div>

    <Footer>
      {#if $user?.permissions?.includes('EDIT_GENRES')}
        <LinkButton href="/genres/{data.id}/edit">Edit</LinkButton>
      {/if}
      <LinkButton kind="outline" href="/genres/{data.id}/history">History</LinkButton>
      <div class="flex-1"></div>
      {#if $user?.permissions?.includes('EDIT_GENRES')}
        <Button kind="text" color="error" onClick={() => (isDeleting = true)}>Delete</Button>
      {/if}
    </Footer>
  </div>
</div>

{#if isDeleting}
  <Dialog
    role="alertdialog"
    title="Delete {data.genre.name}?"
    on:close={() => (isDeleting = false)}
  >
    {#snippet buttons()}
      <form
        method="POST"
        action="?/delete"
        use:enhance={() => {
          isDeleteLoading = true

          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          return async ({ update }) => {
            await update()
            isDeleteLoading = false
          }
        }}
      >
        <Button
          kind="solid"
          color="error"
          type="submit"
          loading={isDeleteLoading}
          disabled={isDeleteLoading}>Delete</Button
        >
      </form>
      <Button kind="text" onClick={() => (isDeleting = false)}>Cancel</Button>
    {/snippet}
  </Dialog>
{/if}

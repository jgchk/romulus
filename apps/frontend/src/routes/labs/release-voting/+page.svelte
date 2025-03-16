<script lang="ts">
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import { ifDefined } from '$lib/utils/types'

  import type { PageData } from './$types'
  import GenreVoteForm from './GenreVoteForm.svelte'
  import type { Genre } from './types'
  import VoteDisplay from './VoteDisplay.svelte'

  type Props = { data: PageData }
  let { data }: Props = $props()

  const descriptorGenre = $derived(data.genres.find((g) => g.name === 'Descriptor'))
  const descriptorIds = $derived(ifDefined(descriptorGenre, getDescendants) ?? new Set<number>())

  function isDescriptor(genre: Genre) {
    return descriptorIds.has(genre.id)
  }

  function getDescendants(genre: Genre): Set<number> {
    const descendants = new Set<number>()
    const queue = [...genre.children]

    while (queue.length) {
      const current = queue.pop()!
      if (descendants.has(current)) continue

      descendants.add(current)

      const currentGenre = data.genres.find((g) => g.id === current)
      if (currentGenre) {
        queue.push(...currentGenre.children)
      }
    }

    return descendants
  }

  const [genres, scenes, descriptors] = $derived.by(() => {
    const categories = {
      genres: [] as Genre[],
      scenes: [] as Genre[],
      descriptors: [] as Genre[],
    }

    for (const genre of data.genres) {
      if (genre.id === descriptorGenre?.id) continue

      if (genre.type === 'SCENE') {
        categories.scenes.push(genre)
      } else if (isDescriptor(genre)) {
        if (genre.id !== descriptorGenre?.id) {
          categories.descriptors.push(genre)
        }
      } else {
        categories.genres.push(genre)
      }
    }

    return [categories.genres, categories.scenes, categories.descriptors]
  })

  let username = $state('username')

  type Votes = Map<string, { agree: Set<number>; disagree: Set<number> }>
  let genreVotes = $state<Votes>(new Map())
  let sceneVotes = $state<Votes>(new Map())
  let descriptorVotes = $state<Votes>(new Map())

  const voteCategories = $derived([
    {
      votes: genreVotes,
      setVotes: (v: Votes) => (genreVotes = v),
      items: genres,
      id: 'genre',
      label: 'Genre',
    },
    {
      votes: sceneVotes,
      setVotes: (v: Votes) => (sceneVotes = v),
      items: scenes,
      id: 'scene',
      label: 'Scene',
    },
    {
      votes: descriptorVotes,
      setVotes: (v: Votes) => (descriptorVotes = v),
      items: descriptors,
      id: 'descriptor',
      label: 'Descriptor',
    },
  ])

  function formatVotes(votes: Votes) {
    const formatted = new Map<number, { genre: Genre; agree: Set<string>; disagree: Set<string> }>()

    for (const [username, userVotes] of votes) {
      for (const [voteType, ids] of Object.entries({
        agree: userVotes.agree,
        disagree: userVotes.disagree,
      })) {
        for (const id of ids) {
          const entry = formatted.get(id) ?? {
            genre: data.genres.find((g) => g.id === id)!,
            agree: new Set(),
            disagree: new Set(),
          }
          entry[voteType as 'agree' | 'disagree'].add(username)
          formatted.set(id, entry)
        }
      }
    }

    return Array.from(formatted.values()).sort((a, b) => a.genre.name.localeCompare(b.genre.name))
  }

  function voteFor(id: number, votes: Votes) {
    const userVotes = votes.get(username) ?? { agree: new Set(), disagree: new Set() }
    userVotes.agree.add(id)
    userVotes.disagree.delete(id)
    return new Map(votes).set(username, userVotes)
  }

  function voteAgainst(id: number, votes: Votes) {
    const userVotes = votes.get(username) ?? { agree: new Set(), disagree: new Set() }
    userVotes.disagree.add(id)
    userVotes.agree.delete(id)
    return new Map(votes).set(username, userVotes)
  }

  function removeVote(id: number, votes: Votes) {
    const userVotes = votes.get(username) ?? { agree: new Set(), disagree: new Set() }
    userVotes.agree.delete(id)
    userVotes.disagree.delete(id)
    return new Map(votes).set(username, userVotes)
  }
</script>

<div class="space-y-8">
  <InputGroup>
    <Label for="username">Username</Label>
    <Input id="username" bind:value={username} />
  </InputGroup>

  {#each voteCategories as category (category.id)}
    <div class="space-y-2">
      <GenreVoteForm
        id={category.id}
        label={category.label}
        onVote={(item) => {
          category.setVotes(voteFor(item.id, category.votes))
        }}
      />

      {#each formatVotes(category.votes) as { genre, agree, disagree } (genre.id)}
        <VoteDisplay
          {genre}
          {agree}
          {disagree}
          onVoteFor={() => category.setVotes(voteFor(genre.id, category.votes))}
          onVoteAgainst={() => category.setVotes(voteAgainst(genre.id, category.votes))}
          onVoteRemove={() => category.setVotes(removeVote(genre.id, category.votes))}
          userHasVoted={!!category.votes.get(username)?.agree.has(genre.id) ||
            !!category.votes.get(username)?.disagree.has(genre.id)}
        />
      {/each}
    </div>
  {/each}
</div>

<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { createGetGenreQuery } from '$lib/features/genres/queries/application/get-genre'
  import { type GenreStore } from '$lib/features/genres/queries/infrastructure'
  import { tw } from '$lib/utils/dom'

  type Props = {
    id: number
    text?: string
    genres: GenreStore
  }

  let { id, text, genres }: Props = $props()

  let genre = $derived(createGetGenreQuery(genres)(id))

  const userSettings = getUserSettingsContext()
</script>

<a
  href={genre ? `/genres/${id}` : `/genre/${id}/history`}
  class={tw('inline-block underline', genre?.nsfw && !$userSettings.showNsfw && 'blur-sm')}
  >{#if text}{text}{:else if genre}{genre.name}{:else}&lt;Deleted Genre&gt;{/if}</a
>{#if genre?.nsfw}&nbsp;<span
    class="align-super text-xs font-bold text-error-500 no-underline transition dark:text-error-700"
    use:tooltip={{ content: 'NSFW' }}
    data-testid="nsfw-indicator">N</span
  >
{/if}

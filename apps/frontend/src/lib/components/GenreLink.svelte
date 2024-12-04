<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import type { GenreType } from '$lib/types/genres'
  import { tw } from '$lib/utils/dom'

  import GenreTypeChip from './GenreTypeChip.svelte'

  type Props = {
    id: number
    name: string
    subtitle?: string | null
    type?: GenreType
    nsfw: boolean
    class?: string
  }

  let { id, name, subtitle, type, nsfw, class: class_ }: Props = $props()

  const userSettings = getUserSettingsContext()
</script>

<a
  href="/genres/{id}"
  class={tw(
    'font-bold text-primary-500 transition hover:underline',
    nsfw && !$userSettings.showNsfw && 'blur-sm',
    class_,
  )}
  use:tooltip={{
    content: 'Enable NSFW genres in settings to view this genre',
    enabled: nsfw && !$userSettings.showNsfw,
  }}
  >{name}{#if subtitle}{' '}<span class="text-[0.875em] text-primary-600 transition"
      >[{subtitle}]</span
    >{/if}{#if type && type !== 'STYLE' && $userSettings.showTypeTags}{' '}<GenreTypeChip
      {type}
      class="bg-primary-100 text-primary-400"
    />{/if}</a
>

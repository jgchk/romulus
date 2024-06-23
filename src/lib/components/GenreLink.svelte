<script lang="ts">
  import { userSettings } from '$lib/contexts/user'
  import type { GenreType } from '$lib/types/genres'
  import { tw } from '$lib/utils/dom'

  import GenreTypeChip from './GenreTypeChip.svelte'

  export let id: number
  export let name: string
  export let subtitle: string | null = null
  export let type: GenreType | undefined = undefined

  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<a href="/genres/{id}" class={tw('font-bold text-primary-500 hover:underline', class_)}
  >{name}{#if subtitle}{' '}<span class="text-[0.875em] text-primary-600 transition"
      >[{subtitle}]</span
    >{/if}{#if type && type !== 'STYLE' && $userSettings.showTypeTags}{' '}<GenreTypeChip
      {type}
      class="bg-primary-100 text-primary-400"
    />{/if}</a
>

<script lang="ts">
  import GenreLink from '$lib/components/GenreLink.svelte'

  import ColumnHeader from './ColumnHeader.svelte'
  import type { Genre } from './types'

  type Props = {
    misplacedScenes: Genre[]
  }

  let { misplacedScenes }: Props = $props()
</script>

<div class="flex-1 overflow-auto p-2">
  <table class="w-full table-fixed overflow-visible">
    <thead>
      <tr>
        <th class="p-1 px-2 text-left">
          <ColumnHeader label="Misplaced Scenes" />
        </th>
      </tr>
    </thead>
    <tbody>
      {#each misplacedScenes as entry (entry.id)}
        <tr>
          <td class="p-1 px-2">
            <GenreLink
              id={entry.id}
              name={entry.name}
              type={entry.type}
              subtitle={entry.subtitle}
              nsfw={entry.nsfw}
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

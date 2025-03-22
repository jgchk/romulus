<script lang="ts">
  import type { GenreDatabase } from '$lib/genre-db/infrastructure/db'

  import RomcodeGenreLink from './RomcodeGenreLink.svelte'
  import RomcodeNode from './RomcodeNode.svelte'
  import type { Node } from './types'

  type Props = {
    node: Node
    genreDatabase: GenreDatabase | undefined
  }

  let { node, genreDatabase }: Props = $props()
</script>

{#if node.type === 'Root'}
  <!-- eslint-disable-next-line svelte/require-each-key -->
  {#each node.children as child}
    <RomcodeNode node={child} {genreDatabase} />
  {/each}
{:else if node.type === 'Paragraph'}
  <p class="mb-3 leading-relaxed text-gray-700 transition last:mb-0 dark:text-gray-300">
    <!-- eslint-disable-next-line svelte/require-each-key -->
    {#each node.children as child}
      <RomcodeNode node={child} {genreDatabase} />
    {/each}
  </p>
{:else if node.type === 'Text'}
  {node.text}
{:else if node.type === 'Bold'}
  <strong>
    <!-- eslint-disable-next-line svelte/require-each-key -->
    {#each node.children as child}
      <RomcodeNode node={child} {genreDatabase} />
    {/each}
  </strong>
{:else if node.type === 'Italic'}
  <em>
    <!-- eslint-disable-next-line svelte/require-each-key -->
    {#each node.children as child}
      <RomcodeNode node={child} {genreDatabase} />
    {/each}
  </em>
{:else if node.type === 'Link'}
  <a href={node.href} target="_blank" rel="noopener noreferrer" class="underline">
    {node.href}
  </a>
{:else if node.type === 'GenreLink' && genreDatabase}
  <RomcodeGenreLink id={node.id} text={node.text} {genreDatabase} />
{/if}

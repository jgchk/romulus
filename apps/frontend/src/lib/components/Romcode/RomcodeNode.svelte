<script lang="ts">
  import RomcodeGenreLink from './RomcodeGenreLink.svelte'
  import RomcodeNode from './RomcodeNode.svelte'
  import type { Node } from './types'

  type Props = {
    node: Node
    genres: { id: number; name: string; nsfw: boolean }[]
  }

  let { node, genres }: Props = $props()
</script>

{#if node.type === 'Root'}
  {#each node.children as child}
    <RomcodeNode node={child} {genres} />
  {/each}
{:else if node.type === 'Paragraph'}
  <p class="mb-3 leading-relaxed text-gray-700 transition last:mb-0 dark:text-gray-300">
    {#each node.children as child}
      <RomcodeNode node={child} {genres} />
    {/each}
  </p>
{:else if node.type === 'Text'}
  {node.text}
{:else if node.type === 'Bold'}
  <strong>
    {#each node.children as child}
      <RomcodeNode node={child} {genres} />
    {/each}
  </strong>
{:else if node.type === 'Italic'}
  <em>
    {#each node.children as child}
      <RomcodeNode node={child} {genres} />
    {/each}
  </em>
{:else if node.type === 'Link'}
  <a href={node.href} target="_blank" rel="noopener noreferrer" class="underline">
    {node.href}
  </a>
{:else if node.type === 'GenreLink'}
  <RomcodeGenreLink id={node.id} text={node.text} {genres} />
{/if}

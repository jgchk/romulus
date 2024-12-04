<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import { ifDefined } from '$lib/utils/types'

  import type { PageData } from './$types'
  import IntegrityTables from './IntegrityTables.svelte'
  import type { Genre } from './types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  const sceneGenre = $derived(data.genres.find((g) => g.name === 'Scene' && g.type === 'META'))
  const sceneDescendentIds = $derived(ifDefined(sceneGenre, getDescendants) ?? new Set<number>())

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

  const [misplacedScenes] = $derived.by(() => {
    const categories = {
      misplacedScenes: [] as Genre[],
    }

    for (const genre of data.genres) {
      if (genre.type === 'SCENE' && !sceneDescendentIds.has(genre.id)) {
        categories.misplacedScenes.push(genre)
      }
    }

    return [categories.misplacedScenes]
  })
</script>

<div class="space-y-8">
  <Card class="h-full p-4">
    <IntegrityTables {misplacedScenes}></IntegrityTables>
  </Card>
</div>

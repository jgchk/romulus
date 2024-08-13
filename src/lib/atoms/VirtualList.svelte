<script lang="ts" context="module">
  type T = unknown
</script>

<script lang="ts" generics="T extends unknown">
  import { onMount, tick } from 'svelte'

  import { cn } from '$lib/utils/dom'

  // props
  export let items: T[]
  export let height: number | string = '100%'
  export let itemHeight: number | undefined = undefined
  export let viewportClass = ''
  export let contentsClass = ''

  // read-only, but visible to consumers via bind:start
  export let start = 0
  export let end = 0

  // local state
  let heightMap: number[] = []
  let rows: HTMLCollectionOf<HTMLElement>
  let viewport: HTMLElement
  let contents: HTMLElement
  let viewportHeight = 0
  let visible: { index: number; data: T }[]
  let mounted: boolean

  let top = 0
  let bottom = 0
  let averageHeight: number

  $: visible = items.slice(start, end).map((data, i) => {
    return { index: i + start, data }
  })

  // whenever `items` changes, invalidate the current heightmap
  $: if (mounted) void refresh(items, viewportHeight, itemHeight)

  async function refresh(items: T[], viewportHeight: number, itemHeight: number | undefined) {
    const { scrollTop } = viewport

    await tick() // wait until the DOM is up to date

    let contentHeight = top - scrollTop
    let i = start

    while (contentHeight < viewportHeight && i < items.length) {
      let row = rows[i - start]

      if (!row) {
        end = i + 1
        await tick() // render the newly visible row
        row = rows[i - start]
      }

      const rowHeight = (heightMap[i] = itemHeight || row.offsetHeight)
      contentHeight += rowHeight
      i += 1
    }

    end = i

    const remaining = items.length - end
    averageHeight = (top + contentHeight) / end

    bottom = remaining * averageHeight
    heightMap.length = items.length
  }

  async function handleScroll() {
    const { scrollTop } = viewport

    const oldStart = start

    for (let v = 0; v < rows.length; v += 1) {
      heightMap[start + v] = itemHeight || rows[v].offsetHeight
    }

    let i = 0
    let y = 0

    while (i < items.length) {
      const rowHeight = heightMap[i] || averageHeight
      if (y + rowHeight > scrollTop) {
        start = i
        top = y

        break
      }

      y += rowHeight
      i += 1
    }

    while (i < items.length) {
      y += heightMap[i] || averageHeight
      i += 1

      if (y > scrollTop + viewportHeight) break
    }

    end = i

    const remaining = items.length - end
    averageHeight = y / end

    while (i < items.length) heightMap[i++] = averageHeight
    bottom = remaining * averageHeight

    // prevent jumping if we scrolled up into unknown territory
    if (start < oldStart) {
      await tick()

      let expectedHeight = 0
      let actualHeight = 0

      for (let i = start; i < oldStart; i += 1) {
        if (rows[i - start]) {
          expectedHeight += heightMap[i]
          actualHeight += itemHeight || rows[i - start].offsetHeight
        }
      }

      const d = actualHeight - expectedHeight
      viewport.scrollTo(0, scrollTop + d)
    }

    // TODO if we overestimated the space these
    // rows would occupy we may need to add some
    // more. maybe we can just call handleScroll again?
  }

  // trigger initial refresh
  onMount(() => {
    rows = contents.getElementsByClassName(
      'svelte-virtual-list-row',
    ) as HTMLCollectionOf<HTMLElement>
    mounted = true
  })
</script>

<div
  class={cn('svelte-virtual-list-viewport', viewportClass)}
  bind:this={viewport}
  bind:offsetHeight={viewportHeight}
  on:scroll={handleScroll}
  style:height
>
  <div
    class={cn('svelte-virtual-list-contents', contentsClass)}
    bind:this={contents}
    style:padding-top="{top}px"
    style:padding-bottom="{bottom}px"
  >
    {#each visible as row (row.index)}
      <div class="svelte-virtual-list-row">
        <slot item={row.data} index={row.index}>Missing template</slot>
      </div>
    {/each}
  </div>
</div>

<style>
  .svelte-virtual-list-viewport {
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: block;
  }

  .svelte-virtual-list-contents,
  .svelte-virtual-list-row {
    display: block;
  }

  .svelte-virtual-list-row {
    overflow: hidden;
  }
</style>

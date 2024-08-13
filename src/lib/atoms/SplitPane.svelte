<script lang="ts" context="module">
  type PartialTouchEvent = { touches: Record<number, { clientX: number }> }
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { cn, tw, unfocus } from '$lib/utils/dom'

  let class_: string | undefined = undefined
  export { class_ as class }

  export let defaultSize: number | undefined = undefined
  export let minSize = 50
  export let maxSize: number | undefined = undefined
  export let onSmallScreenCollapseto: 'left' | 'right' = 'left'

  export let leftSize = getDefaultSize(defaultSize, minSize, maxSize)

  let active = false
  let pos = 0

  let containerRef: HTMLElement | undefined
  let leftRef: HTMLElement | undefined
  let rightRef: HTMLElement | undefined

  const dispatch = createEventDispatcher<{ resize: number }>()

  function handleTouchStart(e: PartialTouchEvent) {
    unfocus()
    active = true
    pos = e.touches[0].clientX
  }

  function handleTouchEnd() {
    if (active) {
      active = false
    }
  }

  function handleTouchMove(e: PartialTouchEvent) {
    if (!active || !leftRef || !containerRef) return

    unfocus()

    const { width } = leftRef.getBoundingClientRect()
    const current = e.touches[0].clientX
    const posDelta = pos - current

    let newMaxSize = maxSize
    if (maxSize !== undefined && maxSize <= 0) {
      newMaxSize = containerRef.getBoundingClientRect().width + maxSize
    }

    let newSize = width - posDelta
    const newPos = pos - posDelta

    if (newSize < minSize) {
      newSize = minSize
    } else if (newMaxSize !== undefined && newSize > newMaxSize) {
      newSize = newMaxSize
    } else {
      pos = newPos
    }

    leftSize = newSize
    dispatch('resize', newSize)
  }

  function handleMouseDown(e: MouseEvent) {
    handleTouchStart({ ...e, touches: [{ clientX: e.clientX }] })
  }

  function handleMouseMove(e: MouseEvent) {
    handleTouchMove({ ...e, touches: [{ clientX: e.clientX }] })
  }

  function getDefaultSize(
    defaultSize: number | undefined,
    minSize: number,
    maxSize: number | undefined,
    draggedSize?: number,
  ) {
    if (draggedSize !== undefined) {
      const min = minSize ?? 0
      const max = maxSize !== undefined && maxSize >= 0 ? maxSize : Number.POSITIVE_INFINITY
      return Math.max(min, Math.min(max, draggedSize))
    }
    if (defaultSize !== undefined) {
      return defaultSize
    }
    return minSize
  }
</script>

<svelte:document
  on:mouseup={handleTouchEnd}
  on:mousemove={handleMouseMove}
  on:touchmove={handleTouchMove}
/>

<div class={tw('flex', class_)} bind:this={containerRef}>
  <div
    class={cn(
      'relative outline-none',
      onSmallScreenCollapseto === 'right' ? 'hidden flex-none md:block' : 'flex-1 md:flex-none',
    )}
    style={leftSize === undefined ? undefined : `width: ${leftSize}px;`}
    bind:this={leftRef}
  >
    <slot name="left" />
  </div>
  <button
    class={tw(
      'group hidden w-px cursor-col-resize rounded-full bg-transparent px-1 py-[6px] transition hover:bg-primary-100 md:block dark:hover:bg-primary-950',
      active && 'bg-primary-100 dark:bg-primary-950',
    )}
    on:mousedown={handleMouseDown}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
  >
    <div
      class={tw(
        'h-full w-px bg-transparent transition group-hover:bg-primary-300 dark:group-hover:bg-primary-700',
        active && 'bg-primary-300 dark:bg-gray-800',
      )}
    />
  </button>
  <div
    class={cn(
      'relative flex-1 outline-none',
      onSmallScreenCollapseto === 'left' && 'hidden md:block',
    )}
    bind:this={rightRef}
  >
    <slot name="right" />
  </div>
</div>

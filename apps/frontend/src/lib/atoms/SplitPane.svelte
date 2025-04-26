<script lang="ts" module>
  type PartialTouchEvent = { touches: Record<number, { clientX: number }> }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  import { cn, tw, unfocus } from '$lib/utils/dom'

  type Props = {
    class?: string
    defaultSize?: number
    minSize?: number
    maxSize?: number
    onSmallScreenCollapseto?: 'left' | 'right'
    leftSize?: number
    left?: Snippet
    right?: Snippet
  }

  let {
    class: class_,
    defaultSize,
    minSize = 50,
    maxSize,
    onSmallScreenCollapseto = 'left',
    leftSize = $bindable(getDefaultSize(defaultSize, minSize, maxSize)),
    left,
    right,
  }: Props = $props()

  let active = $state(false)
  let pos = 0

  let containerRef: HTMLElement | undefined = $state()
  let leftRef: HTMLElement | undefined = $state()
  let rightRef: HTMLElement | undefined = $state()

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
  onmouseup={handleTouchEnd}
  onmousemove={handleMouseMove}
  ontouchmove={handleTouchMove}
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
    {@render left?.()}
  </div>
  <button
    aria-label="Resize"
    type="button"
    class={tw(
      'group hidden w-px cursor-col-resize rounded-full bg-transparent px-1 py-[6px] transition hover:bg-primary-100 md:block dark:hover:bg-primary-950',
      active && 'bg-primary-100 dark:bg-primary-950',
    )}
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
  >
    <div
      class={tw(
        'h-full w-px bg-transparent transition group-hover:bg-primary-300 dark:group-hover:bg-primary-700',
        active && 'bg-primary-300 dark:bg-gray-800',
      )}
    ></div>
  </button>
  <div
    class={cn(
      'relative flex-1 outline-none',
      onSmallScreenCollapseto === 'left' && 'hidden md:block',
    )}
    bind:this={rightRef}
  >
    {@render right?.()}
  </div>
</div>

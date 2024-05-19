<script lang="ts" context="module">
  let currId = 0
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { cn } from '$lib/utils/dom'
  import { isNotNull } from '$lib/utils/types'

  export let id = `file-drop-${Date.now()}-${currId++}`
  export let multiple = false
  let class_: string | undefined = undefined
  export { class_ as class }

  let isDraggedOver = false

  const dispatch = createEventDispatcher<{ drop: File[] }>()

  const handleDrop = (
    e: DragEvent & {
      currentTarget: EventTarget & HTMLDivElement
    },
  ) => {
    const files = e.dataTransfer?.items
      ? [...e.dataTransfer.items].map((item) => item.getAsFile()).filter(isNotNull)
      : e.dataTransfer?.files
        ? [...e.dataTransfer.files]
        : []
    dispatch('drop', files)
  }
</script>

<div
  tabindex={0}
  role="button"
  class={cn(
    'center rounded-lg border border-gray-700 p-4 outline-dashed outline-1 outline-gray-700 transition-all',
    isDraggedOver ? 'bg-gray-800 -outline-offset-[12px]' : 'bg-gray-900 -outline-offset-8',
    class_,
  )}
  on:drop|preventDefault={handleDrop}
  on:dragover|preventDefault={() => (isDraggedOver = true)}
  on:dragenter|preventDefault={() => (isDraggedOver = true)}
  on:dragleave|preventDefault={() => (isDraggedOver = false)}
  on:dragend|preventDefault={() => (isDraggedOver = false)}
  on:drop|preventDefault={() => (isDraggedOver = false)}
>
  <input
    {id}
    class="hidden"
    type="file"
    {multiple}
    on:change={(e) => {
      const files = e.currentTarget.files
      if (files) {
        dispatch('drop', [...files])
      }
    }}
  />
  <span>
    <label class="cursor-pointer font-semibold hover:underline" for={id}>Choose a file</label> or drag
    it here.
  </span>
</div>

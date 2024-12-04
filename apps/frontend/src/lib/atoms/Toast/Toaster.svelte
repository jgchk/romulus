<script lang="ts">
  import { fly, slide } from 'svelte/transition'

  import { tw } from '$lib/utils/dom'

  import { toast } from './toast'
  import Toast from './Toast.svelte'

  type Props = {
    class?: string
  }

  let { class: class_ }: Props = $props()

  const IN_DURATION = 200
  const OUT_DURATION = 175
  const FLY_SIZE = 50
</script>

<ul
  class={tw(
    'pointer-events-none absolute right-0 top-0 z-50 flex h-full max-w-full flex-col items-end overflow-x-hidden',
    class_,
  )}
>
  {#each $toast as item (item.id)}
    <li
      in:fly|local={{ x: FLY_SIZE, duration: IN_DURATION }}
      out:fly|local={{ x: FLY_SIZE, duration: OUT_DURATION }}
      class="group max-w-full"
    >
      <div
        in:slide|local={{ duration: IN_DURATION }}
        out:slide|local={{ duration: OUT_DURATION }}
        class="pointer-events-auto mb-1.5 !overflow-visible group-last:mb-0"
      >
        <Toast {item} />
      </div>
    </li>
  {/each}
</ul>

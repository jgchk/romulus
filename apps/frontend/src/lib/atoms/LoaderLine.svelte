<script lang="ts">
  import { cn } from '$lib/utils/dom'

  type Props = {
    class?: string
  }

  let { class: class_ }: Props = $props()
</script>

<div
  class={cn(
    'line-group--indeterminate relative h-[3px] w-full overflow-hidden rounded-full bg-transparent',
    class_,
  )}
>
  <div
    class="line absolute -left-[80%] top-0 h-full rounded-full bg-current will-change-[left,_right]"
  ></div>
</div>

<style>
  .line {
    animation: indeterminate 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
  }

  @keyframes indeterminate {
    0% {
      left: -35%;
      right: 100%;
    }
    80%,
    100% {
      left: 100%;
      right: -160%;
    }
  }
</style>

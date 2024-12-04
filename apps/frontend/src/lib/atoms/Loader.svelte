<script lang="ts">
  import { tw } from '$lib/utils/dom'

  type Props = {
    size?: number
    class?: string
  }

  let { size, class: class_ }: Props = $props()
</script>

<svg
  class={tw('spinner stroke-[10%]', class_)}
  height={size ?? '100%'}
  width={size ?? '100%'}
  viewBox="0 0 50 50"
>
  <circle class="path stroke-current" cx="25" cy="25" r="20" fill="none" />
</svg>

<style>
  .spinner {
    animation: rotate 2s linear infinite;
  }

  .spinner .path {
    stroke: currentColor;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
</style>

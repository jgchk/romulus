<script lang="ts">
  export let size: number | undefined = undefined
  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<svg
  stroke="currentColor"
  fill="currentColor"
  stroke-width="0"
  viewBox="0 0 24 24"
  height={size ?? '100%'}
  width={size ?? '100%'}
  class={class_}
>
  <path d="M8 12L14 6V18L8 12Z" />
</svg>

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
  <path
    d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
  />
</svg>

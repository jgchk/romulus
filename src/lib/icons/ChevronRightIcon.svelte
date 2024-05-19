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
    d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"
  />
</svg>

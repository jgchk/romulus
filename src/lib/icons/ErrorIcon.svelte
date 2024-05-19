<script lang="ts">
  export let size: number | undefined = undefined
  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  stroke-width="2"
  height={size ?? '100%'}
  width={size ?? '100%'}
  class={class_}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  />
</svg>

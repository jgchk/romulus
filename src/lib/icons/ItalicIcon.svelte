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
  <path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z" />
</svg>

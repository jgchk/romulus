<script lang="ts">
  import { page } from '$app/stores'

  type Props = {
    label: string
  }

  let { label }: Props = $props()

  let href = $derived.by(() => {
    const params = new URLSearchParams($page.url.searchParams)

    return '?' + params.toString()
  })
</script>

<a class="flex items-center gap-1" {href}>
  {label}
</a>

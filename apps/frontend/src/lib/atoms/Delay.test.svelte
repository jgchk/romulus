<script lang="ts">
  import type { ComponentProps } from 'svelte'

  import Delay from './Delay.svelte'

  let props: Omit<ComponentProps<typeof Delay>, 'children'> = $props()
</script>

<Delay {...props}>
  <div data-testId="child"></div>
</Delay>

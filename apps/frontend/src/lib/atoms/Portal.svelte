<script lang="ts" module>
  import type { Snippet } from 'svelte'
  import { tick } from 'svelte'

  export function portal(el: HTMLElement, target: HTMLElement | string = 'body') {
    let targetEl: Element | null

    async function update(newTarget: HTMLElement | string) {
      target = newTarget
      if (typeof target === 'string') {
        targetEl = document.querySelector(target)
        if (targetEl === null) {
          await tick()
          targetEl = document.querySelector(target)
        }
        if (targetEl === null) {
          throw new Error(`No element found matching css selector: "${target}"`)
        }
      } else if (target instanceof HTMLElement) {
        targetEl = target
      } else {
        throw new TypeError(
          `Unknown portal target type: ${
            target === null ? 'null' : typeof target
          }. Allowed types: string (CSS selector) or HTMLElement.`,
        )
      }
      targetEl.appendChild(el)
      el.hidden = false
    }

    function destroy() {
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }

    void update(target)

    return {
      update,
      destroy,
    }
  }
</script>

<script lang="ts">
  let { target = 'body', children }: { target?: HTMLElement | string; children?: Snippet } =
    $props()
</script>

<div use:portal={target} hidden>
  {@render children?.()}
</div>

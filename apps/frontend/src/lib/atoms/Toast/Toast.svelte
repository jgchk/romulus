<script lang="ts">
  import { CheckCircle, Info, Warning, X, XCircle } from 'phosphor-svelte'
  import { onMount } from 'svelte'
  import { linear } from 'svelte/easing'
  import { run } from 'svelte/legacy'
  import { tweened } from 'svelte/motion'

  import { cn } from '$lib/utils/dom'

  import type { Toast } from './toast'
  import { toast, ToastDefaults } from './toast'

  type Props = {
    item: Toast
  }

  let { item }: Props = $props()
  let duration = $derived(item.duration ?? ToastDefaults.duration)
  let variant = $derived(item.variant ?? 'info')

  const progress = $derived(tweened(0, { duration, easing: linear }))

  const close = () => toast.hide(item.id)
  run(() => {
    if ($progress === 1) {
      close()
    }
  })

  const pause = () => {
    void progress.set($progress, { duration: 0 })
  }

  const resume = () => {
    void progress.set(1, { duration: duration * (1 - $progress) })
  }

  onMount(() => resume())
</script>

<div role="alert" onmouseenter={pause} onmouseleave={resume} class="group/container flex shadow">
  <button
    type="button"
    onclick={close}
    class={cn(
      'center group/button w-10 rounded-l-lg border border-r-0 transition',
      variant === 'info' &&
        'border-info-500 bg-info-600 text-info-100 hover:border-info-600 hover:bg-info-700',
      variant === 'success' &&
        'border-success-500 bg-success-600 text-success-100 hover:border-success-600 hover:bg-success-700',
      variant === 'error' &&
        'border-error-500 bg-error-600 text-error-100 hover:border-error-600 hover:bg-error-700',
      variant === 'warning' &&
        'border-warning-500 bg-warning-600 text-warning-100 hover:border-warning-600 hover:bg-warning-700',
    )}
  >
    <div class="center relative h-5 w-5 group-active:top-px">
      <div
        class="h-5 w-5 opacity-100 transition-all duration-200 group-hover/container:h-0 group-hover/container:w-0 group-hover/container:opacity-0"
      >
        {#if variant === 'success'}
          <CheckCircle size="100%" />
        {:else if variant === 'error'}
          <XCircle size="100%" />
        {:else if variant === 'warning'}
          <Warning size="100%" />
        {:else}
          <Info size="100%" />
        {/if}
      </div>
      <div
        class="absolute left-0 top-0 flex h-full w-full items-center justify-center opacity-0 transition-all duration-300 group-hover/container:opacity-100"
      >
        <X size={18} />
      </div>
    </div>
  </button>

  <div
    class="relative flex min-w-0 flex-1 flex-col rounded-r-lg border border-l-0 border-gray-300 bg-gray-200 transition dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="break-words px-3 py-2">
      {#if typeof item.msg === 'string'}
        {item.msg}
      {:else}
        <item.msg {...item.props} toast={item} />
      {/if}
    </div>

    {#if duration !== Infinity}
      <progress
        value={$progress}
        class={cn('absolute -bottom-px h-px', variant)}
        style="width: calc(100% - 3px)"
      ></progress>
    {/if}
  </div>
</div>

<style lang="postcss">
  progress {
    background: theme(colors.transparent);
    appearance: none;
  }

  progress::-webkit-progress-bar {
    background: theme(colors.transparent);
  }

  progress.info::-webkit-progress-value,
  progress.info::-moz-progress-bar {
    background: theme(colors.info.500);
  }

  progress.success::-webkit-progress-value,
  progress.success::-moz-progress-bar {
    background: theme(colors.success.500);
  }

  progress.error::-webkit-progress-value,
  progress.error::-moz-progress-bar {
    background: theme(colors.error.500);
  }

  progress.warning::-webkit-progress-value,
  progress.warning::-moz-progress-bar {
    background: theme(colors.warning.500);
  }
</style>

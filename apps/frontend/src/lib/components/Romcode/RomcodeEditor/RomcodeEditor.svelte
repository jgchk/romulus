<script lang="ts" module>
  const Tabs = Object.freeze({
    EDIT: 'Edit',
    VIEW: 'View',
  })
  type Tab = (typeof Tabs)[keyof typeof Tabs]
</script>

<script lang="ts">
  import { Link, TextB, TextItalic } from 'phosphor-svelte'

  import IconButton from '$lib/atoms/IconButton.svelte'
  import type { GenreStore } from '$lib/features/genres/queries/infrastructure'
  import { makeGenreTag } from '$lib/types/genres'
  import { cn, tw } from '$lib/utils/dom'

  import Romcode from '../Romcode.svelte'
  import GenreSearchDialog from './GenreSearchDialog.svelte'

  type Props = {
    id?: string
    value?: string
    disabled?: boolean
    autofocus?: boolean
    class?: string
    onChange?: (value: string) => void
    genres: Promise<GenreStore>
  }

  let {
    id,
    value = $bindable(''),
    disabled = false,
    autofocus = false,
    class: class_,
    onChange,
    genres,
  }: Props = $props()

  let tab: Tab = $state(Tabs.EDIT)
  let showGenreDialog: boolean | string = $state(false)

  let ta: HTMLTextAreaElement | undefined = $state()

  $effect(() => {
    onChange?.(value)
  })

  function handleInsertGenreTag(id: number) {
    const genreTag = makeGenreTag(id)
    if (ta && (ta.selectionStart || ta.selectionStart === 0)) {
      const startPos = ta.selectionStart
      const endPos = ta.selectionEnd

      const updatedValue = value.slice(0, startPos) + genreTag + value.slice(endPos)

      ta.value = updatedValue
      ta.focus()
      ta.selectionStart = startPos + genreTag.length
      ta.selectionEnd = startPos + genreTag.length

      value = updatedValue
    } else {
      value = value + genreTag
    }
  }

  function handleBold() {
    if (!ta) return

    const startPos = ta.selectionStart
    const endPos = ta.selectionEnd

    const updatedValue =
      value.slice(0, startPos) + '**' + value.slice(startPos, endPos) + '**' + value.slice(endPos)

    ta.value = updatedValue
    ta.focus()
    ta.selectionStart = endPos + 4
    ta.selectionEnd = endPos + 4

    value = updatedValue
  }

  function handleItalic() {
    if (!ta) return

    const startPos = ta.selectionStart
    const endPos = ta.selectionEnd

    const updatedValue =
      value.slice(0, startPos) + '*' + value.slice(startPos, endPos) + '*' + value.slice(endPos)

    ta.value = updatedValue
    ta.focus()
    ta.selectionStart = endPos + 2
    ta.selectionEnd = endPos + 2

    value = updatedValue
  }
</script>

<div
  class={tw(
    'flex h-72 resize-y flex-col overflow-auto rounded border border-gray-300 text-sm text-gray-800 transition focus-within:border-secondary-500 dark:border-gray-600 dark:text-gray-200',
    class_,
  )}
>
  {#if tab === Tabs.EDIT}
    <div class="flex flex-1 flex-col">
      <div
        class="flex border-b border-gray-300 bg-gray-100 transition dark:border-gray-700 dark:bg-gray-900"
      >
        <IconButton class="rounded-none" tooltip="Bold" onClick={() => handleBold()}>
          <TextB />
        </IconButton>
        <IconButton class="rounded-none" tooltip="Italic" onClick={() => handleItalic()}>
          <TextItalic />
        </IconButton>
        <IconButton
          class="rounded-none"
          tooltip="Insert genre link"
          onClick={() => {
            if (!ta) {
              showGenreDialog = true
              return
            }

            const startPos = ta.selectionStart
            const endPos = ta.selectionEnd
            const selectedText = value.slice(startPos, endPos)
            showGenreDialog = selectedText || true
          }}
        >
          <Link />
        </IconButton>
      </div>

      <!-- svelte-ignore a11y_autofocus -->
      <textarea
        bind:this={ta}
        {id}
        class="flex-1 resize-none bg-black bg-opacity-[0.04] p-1.5 transition hover:bg-opacity-[0.07] focus:outline-none dark:bg-white dark:bg-opacity-5 dark:hover:bg-opacity-10"
        bind:value
        {disabled}
        {autofocus}
      >
      </textarea>
    </div>
  {:else if tab === Tabs.VIEW}
    <div class="flex-1 overflow-auto px-2 py-1">
      <Romcode data={value} {genres} />
    </div>
  {/if}

  <div
    class="flex border-t border-gray-300 bg-gray-100 transition dark:border-gray-700 dark:bg-gray-900"
  >
    <button
      class={cn(
        'border-r border-gray-200 px-2 py-1 text-xs uppercase text-gray-400 transition hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700',
        tab === Tabs.EDIT ? 'font-bold' : 'font-medium',
      )}
      type="button"
      onclick={() => (tab = Tabs.EDIT)}
    >
      Edit
    </button>
    <button
      class={cn(
        'border-r border-gray-200 px-2 py-1 text-xs uppercase text-gray-400 transition hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700',
        tab === Tabs.VIEW ? 'font-bold' : 'font-medium',
      )}
      type="button"
      onclick={() => (tab = Tabs.VIEW)}
    >
      View
    </button>
  </div>
</div>

{#if showGenreDialog}
  {#await genres then genres}
    <GenreSearchDialog
      filter={typeof showGenreDialog === 'string' ? showGenreDialog : undefined}
      on:close={() => (showGenreDialog = false)}
      on:select={(e) => {
        handleInsertGenreTag(e.detail.id)
        showGenreDialog = false
      }}
      {genres}
    />
  {/await}
{/if}

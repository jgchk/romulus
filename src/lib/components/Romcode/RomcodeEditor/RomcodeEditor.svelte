<script lang="ts" context="module">
  enum Tab {
    EDIT,
    VIEW,
  }
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import IconButton from '$lib/atoms/IconButton.svelte'
  import BoldIcon from '$lib/icons/BoldIcon.svelte'
  import ItalicIcon from '$lib/icons/ItalicIcon.svelte'
  import LinkIcon from '$lib/icons/LinkIcon.svelte'
  import { makeGenreTag, type SimpleGenre } from '$lib/types/genres'
  import { cn, tw } from '$lib/utils/dom'

  import Romcode from '../Romcode.svelte'
  import GenreSearchDialog from './GenreSearchDialog.svelte'

  export let id: string | undefined = undefined
  export let value: string = ''
  export let genres: SimpleGenre[]
  export let disabled = false
  export let autofocus = false

  let class_: string | undefined = undefined
  export { class_ as class }

  let tab: Tab = Tab.EDIT
  let showGenreDialog: boolean | string = false

  let ta: HTMLTextAreaElement | undefined

  const dispatch = createEventDispatcher<{ change: string }>()
  $: dispatch('change', value)

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
    'flex h-72 resize-y flex-col overflow-auto rounded border border-gray-500 bg-gray-200 text-sm text-gray-800 transition focus-within:border-secondary-500 dark:bg-gray-800 dark:text-gray-200',
    class_,
  )}
>
  {#if tab === Tab.EDIT}
    <div class="flex flex-1 flex-col">
      <div
        class="flex border-b border-gray-300 bg-gray-100 transition dark:border-gray-700 dark:bg-gray-900"
      >
        <IconButton tooltip="Bold" on:click={() => handleBold()}>
          <BoldIcon />
        </IconButton>
        <IconButton tooltip="Italic" on:click={() => handleItalic()}>
          <ItalicIcon />
        </IconButton>
        <IconButton
          tooltip="Insert genre link"
          on:click={() => {
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
          <LinkIcon />
        </IconButton>
      </div>

      <!-- svelte-ignore a11y-autofocus -->
      <textarea
        bind:this={ta}
        {id}
        class="flex-1 resize-none bg-transparent p-1.5 transition hover:bg-gray-300 focus:outline-none active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600"
        bind:value
        on:blur
        {disabled}
        {autofocus}
      />
    </div>
  {:else if tab === Tab.VIEW}
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
        tab === Tab.EDIT ? 'font-bold' : 'font-medium',
      )}
      type="button"
      on:click={() => (tab = Tab.EDIT)}
    >
      Edit
    </button>
    <button
      class={cn(
        'border-r border-gray-200 px-2 py-1 text-xs uppercase text-gray-400 transition hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700',
        tab === Tab.VIEW ? 'font-bold' : 'font-medium',
      )}
      type="button"
      on:click={() => (tab = Tab.VIEW)}
    >
      View
    </button>
  </div>
</div>

{#if showGenreDialog}
  <GenreSearchDialog
    {genres}
    filter={typeof showGenreDialog === 'string' ? showGenreDialog : undefined}
    on:close={() => (showGenreDialog = false)}
    on:select={(e) => {
      handleInsertGenreTag(e.detail.id)
      showGenreDialog = false
    }}
  />
{/if}

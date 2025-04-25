<script lang="ts">
  import { Select } from '$lib/atoms/Select'
  import {
    getGenreRelevanceText,
    MAX_GENRE_RELEVANCE,
    MIN_GENRE_RELEVANCE,
    UNSET_GENRE_RELEVANCE,
  } from '$lib/types/genres'
  import { range } from '$lib/utils/array'
  import { ifDefined } from '$lib/utils/types'

  type Props = {
    id?: string
    class?: string
    value?: number
    onChange?: (value: number | undefined) => void
  }

  let { value = $bindable(undefined), id, class: class_, onChange }: Props = $props()

  const options = [
    ...range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1).reverse(),
    UNSET_GENRE_RELEVANCE,
  ]

  function displayRelevance(relevance: number | undefined) {
    if (relevance === undefined || relevance === UNSET_GENRE_RELEVANCE) {
      return getGenreRelevanceText(relevance)
    } else {
      return `${relevance} - ${getGenreRelevanceText(relevance)}`
    }
  }
</script>

<Select.Root
  value={value?.toString()}
  options={options.map((v) => v.toString())}
  onChange={(vs) => {
    const v = ifDefined(vs, Number.parseInt)
    value = v
    onChange?.(v)
  }}
  class={class_}
>
  <Select.Trigger {id}>
    {displayRelevance(value)}
  </Select.Trigger>
  <Select.Options>
    {#each options as option (option)}
      <Select.Option value={option.toString()}>
        {displayRelevance(option)}
      </Select.Option>
    {/each}
  </Select.Options>
</Select.Root>

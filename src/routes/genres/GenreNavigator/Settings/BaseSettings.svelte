<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Checkbox from '$lib/atoms/Checkbox.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import RelevanceSelect from '../../RelevanceSelect.svelte'

  export let genreRelevanceFilter: number
  export let showRelevanceTags: boolean
  export let showTypeTags: boolean
  export let showNsfw: boolean

  const dispatch = createEventDispatcher<{
    change: {
      genreRelevanceFilter?: number
      showRelevanceTags?: boolean
      showTypeTags?: boolean
      showNsfw?: boolean
    }
  }>()
</script>

<InputGroup>
  <Label for="relevance-filter">Relevance Filter</Label>
  <RelevanceSelect
    id="relevance-filter"
    class="w-full"
    value={genreRelevanceFilter}
    on:change={(e) => dispatch('change', { genreRelevanceFilter: e.detail.value })}
  />
</InputGroup>

<InputGroup>
  <Checkbox
    id="show-relevance-tags"
    checked={showRelevanceTags}
    on:change={(e) => dispatch('change', { showRelevanceTags: e.currentTarget.checked })}
  />
  <Label for="show-relevance-tags">Show Relevance Tags</Label>
</InputGroup>

<InputGroup layout="horizontal">
  <Checkbox
    id="show-type-tags"
    checked={showTypeTags}
    on:change={(e) => dispatch('change', { showTypeTags: e.currentTarget.checked })}
  />
  <Label for="show-type-tags">Show Type Tags</Label>
</InputGroup>

<InputGroup layout="horizontal">
  <Checkbox
    id="show-nsfw"
    checked={showNsfw}
    on:change={(e) => dispatch('change', { showNsfw: e.currentTarget.checked })}
  />
  <Label for="show-nsfw">Show NSFW Genres</Label>
</InputGroup>

<script lang="ts">
  import Checkbox from '$lib/atoms/Checkbox.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import RelevanceSelect from '../../RelevanceSelect.svelte'

  type Props = {
    genreRelevanceFilter: number
    showRelevanceTags: boolean
    showTypeTags: boolean
    showNsfw: boolean
    onChange?: (value: {
      genreRelevanceFilter?: number
      showRelevanceTags?: boolean
      showTypeTags?: boolean
      showNsfw?: boolean
    }) => void
  }

  let { genreRelevanceFilter, showRelevanceTags, showTypeTags, showNsfw, onChange }: Props =
    $props()
</script>

<InputGroup>
  <Label for="relevance-filter">Relevance Filter</Label>
  <RelevanceSelect
    id="relevance-filter"
    class="w-full"
    value={genreRelevanceFilter}
    on:change={(e) => onChange?.({ genreRelevanceFilter: e.detail.value })}
  />
</InputGroup>

<InputGroup layout="horizontal">
  <Checkbox
    id="show-relevance-tags"
    checked={showRelevanceTags}
    onChange={(checked) => onChange?.({ showRelevanceTags: checked })}
  />
  <Label for="show-relevance-tags">Show Relevance Tags</Label>
</InputGroup>

<InputGroup layout="horizontal">
  <Checkbox
    id="show-type-tags"
    checked={showTypeTags}
    onChange={(checked) => onChange?.({ showTypeTags: checked })}
  />
  <Label for="show-type-tags">Show Type Tags</Label>
</InputGroup>

<InputGroup layout="horizontal">
  <Checkbox
    id="show-nsfw"
    checked={showNsfw}
    onChange={(checked) => onChange?.({ showNsfw: checked })}
  />
  <Label for="show-nsfw">Show NSFW Genres</Label>
</InputGroup>

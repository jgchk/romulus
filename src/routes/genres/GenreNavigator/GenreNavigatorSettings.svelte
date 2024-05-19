<script lang="ts">
  import Checkbox from '$lib/atoms/Checkbox.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import { user, userSettings } from '$lib/contexts/user'

  import RelevanceSelect from '../RelevanceSelect.svelte'
</script>

{#if $user}
  {@const user_ = $user}
  <InputGroup>
    <Label for="relevance-filter">Relevance Filter</Label>
    <RelevanceSelect
      id="relevance-filter"
      class="w-full"
      value={$userSettings.genreRelevanceFilter}
      on:change={(e) => {
        void fetch(`/api/accounts/${user_.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ genreRelevanceFilter: e.detail.value }),
        })
          .then((res) => res.json())
          .then((res) => ($user = res))
      }}
    />
  </InputGroup>

  <InputGroup layout="horizontal">
    <Checkbox
      id="type-tags"
      checked={$userSettings.showTypeTags}
      on:change={(e) => {
        void fetch(`/api/accounts/${user_.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ showTypeTags: e.currentTarget.checked }),
        })
          .then((res) => res.json())
          .then((res) => ($user = res))
      }}
    />
    <Label for="type-tags">Show Type Tags</Label>
  </InputGroup>

  <InputGroup layout="horizontal">
    <Checkbox
      id="relevance-tags"
      checked={$userSettings.showRelevanceTags}
      on:change={(e) => {
        void fetch(`/api/accounts/${user_.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ showRelevanceTags: e.currentTarget.checked }),
        })
          .then((res) => res.json())
          .then((res) => ($user = res))
      }}
    />
    <Label for="relevance-tags">Show Relevance Tags</Label>
  </InputGroup>
{:else}
  <div>
    Please <a href="/sign-in" class="text-primary-500 hover:underline">sign in</a> to access settings.
  </div>
{/if}

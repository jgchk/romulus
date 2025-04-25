<script lang="ts">
  import MediaTypeForm from '$lib/features/media/components/MediaTypeForm.svelte'
  import { pageTitle } from '$lib/utils/string'

  import { type PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()
</script>

<svelte:head>
  <title>{pageTitle('New Media Type', 'Media Types')}</title>
</svelte:head>

<MediaTypeForm data={data.form} mediaTypes={data.mediaTypes} />

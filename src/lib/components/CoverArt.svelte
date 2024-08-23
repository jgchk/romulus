<script lang="ts">
  import { tw } from '$lib/utils/dom'

  export let art: string | null
  export let title: string
  export let artists: string[]

  let class_: string | undefined = undefined
  export { class_ as class }

  const placeholderArt = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='208' height='208' viewBox='0 0 208 208'%3E%3Crect width='208' height='208' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' fill='%23666666'%3ENo Image%3C/text%3E%3C/svg%3E`

  function createCoverArtAltText(title: string, artists: string[]) {
    if (artists.length === 0) {
      return `Album cover art for '${title}'`
    }

    return `Album cover art for '${title}' by ${formatArtistList(artists)}`
  }

  function formatArtistList(artists: string[]): string {
    if (artists.length === 0) {
      return ''
    }

    if (artists.length === 1) {
      return artists[0]
    }

    if (artists.length === 2) {
      return `${artists[0]} and ${artists[1]}`
    }

    const lastArtist = artists.pop()
    return `${artists.join(', ')}, and ${lastArtist}`
  }
</script>

<img
  src={art ?? placeholderArt}
  class={tw('object-cover', class_)}
  alt={createCoverArtAltText(title, artists)}
/>

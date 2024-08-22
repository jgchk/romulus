export function createCoverArtAltText(title: string, artists: string[]) {
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

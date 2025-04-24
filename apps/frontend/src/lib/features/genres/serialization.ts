import type { GenreType } from '$lib/types/genres'

import type { TreeGenre } from './queries/types'

export function stringifyTreeGenre(genre: TreeGenre): string {
  let s = '' + genre.id
  // name
  s += ':' + genre.name.length + ':' + genre.name
  // subtitle (null => length -1)
  s += ':' + (genre.subtitle === null ? -1 : genre.subtitle.length)
  if (genre.subtitle !== null) {
    s += ':' + genre.subtitle
  }
  // type
  s += ':' + genre.type.length + ':' + genre.type
  // relevance
  s += ':' + genre.relevance
  // nsfw flag
  s += ':' + (genre.nsfw ? 1 : 0)
  // children
  s += ':' + genre.children.length
  for (const c of genre.children) {
    s += ':' + c
  }
  // derivations
  s += ':' + genre.derivations.length
  for (const d of genre.derivations) {
    s += ':' + d
  }
  // akas
  s += ':' + genre.akas.length
  for (const aka of genre.akas) {
    s += ':' + aka.length + ':' + aka
  }
  // updatedAt (ms since epoch)
  s += ':' + genre.updatedAt.getTime()
  return s
}

export function parseTreeGenre(s: string): TreeGenre {
  let i = 0
  const len = s.length

  // read initial id until first ':'
  let start = 0
  while (i < len && s.charAt(i) !== ':') {
    i++
  }
  if (i >= len) {
    throw new Error('Invalid TreeGenre string')
  }
  const id = Number(s.slice(start, i))

  function nextNum(allowLast = false): number {
    // expect ':' delimiter
    if (s.charAt(i) !== ':') {
      throw new Error(`Expected ':' at position ${i}`)
    }
    i++ // skip ':'
    start = i
    // scan to next ':' or end
    while (i < len && s.charAt(i) !== ':') {
      i++
    }
    if (i >= len) {
      if (allowLast) {
        const num = Number(s.slice(start))
        i = len
        return num
      }
      throw new Error('Malformed TreeGenre string')
    }
    return Number(s.slice(start, i))
  }

  function nextStr(l: number): string {
    // expect ':' before actual string
    if (s.charAt(i) !== ':') {
      throw new Error(`Expected ':' at position ${i}`)
    }
    i++
    const str = s.slice(i, i + l)
    i += l
    return str
  }

  // name
  const nameLen = nextNum()
  const name = nextStr(nameLen)

  // subtitle
  const subLen = nextNum()
  const subtitle = subLen === -1 ? null : nextStr(subLen)

  // type
  const typeLen = nextNum()
  const type = nextStr(typeLen) as GenreType

  // relevance
  const relevance = nextNum()

  // nsfw
  const nsfw = nextNum() === 1

  // children
  const childCount = nextNum()
  const children: number[] = new Array(childCount) as number[]
  for (let k = 0; k < childCount; k++) {
    children[k] = nextNum()
  }

  // derivations
  const derivCount = nextNum()
  const derivations: number[] = new Array(derivCount) as number[]
  for (let k = 0; k < derivCount; k++) {
    derivations[k] = nextNum()
  }

  // akas
  const akaCount = nextNum()
  const akas: string[] = new Array(akaCount) as string[]
  for (let k = 0; k < akaCount; k++) {
    const l = nextNum()
    akas[k] = nextStr(l)
  }

  // updatedAt (last field, allow end-of-string)
  const updatedMs = nextNum(true)

  return {
    id,
    name,
    subtitle,
    type,
    relevance,
    nsfw,
    children,
    derivations,
    akas,
    updatedAt: new Date(updatedMs),
  }
}

import { compareTwoStrings } from 'string-similarity'

import { toAscii } from './string'

const toFilterString = (s: string) => toAscii(s.toLowerCase())
export const getMatchWeight = (name: string, filter: string) => {
  const fName = toFilterString(name)
  const fFilter = toFilterString(filter)

  if (fName.length < 2 || fFilter.length < 2) {
    if (fName.startsWith(fFilter)) {
      return 1
    } else if (fName.includes(fFilter)) {
      return 0.5
    } else {
      return 0
    }
  }

  return compareTwoStrings(fName, fFilter)
}

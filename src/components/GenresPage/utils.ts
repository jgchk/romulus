export const getGenreRelevanceText = (relevance: number) => {
  switch (relevance) {
    case 1:
      return 'Unknown'
    case 2:
      return 'Unestablished'
    case 3:
      return 'Minor'
    case 4:
      return 'Significant'
    case 5:
      return 'Major'
    case 6:
      return 'Essential'
    case 7:
      return 'Universal'
    default:
      throw new Error(`Not a valid relevance: ${relevance}`)
  }
}

import { trpc } from '../utils/trpc'

export const useAddSchemaMutation = () => {
  return trpc.useMutation(['schema.add'])
}

// music
// podcasts
// film
// tv
// fashion
// food
// online video
// sports
// video games
// board games
// other games

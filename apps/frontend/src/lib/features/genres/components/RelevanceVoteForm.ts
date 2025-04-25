import { z } from 'zod'

import { genreRelevance } from '$lib/types/genres'

export const relevanceVoteSchema = z.object({
  relevanceVote: genreRelevance,
})

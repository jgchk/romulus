export const GenresPermission = {
  CreateGenres: 'genres:create-genres',
  EditGenres: 'genres:edit-genres',
  DeleteGenres: 'genres:delete-genres',
  VoteGenreRelevance: 'genres:vote-genre-relevance',
} as const

export type GenresPermission = (typeof GenresPermission)[keyof typeof GenresPermission]

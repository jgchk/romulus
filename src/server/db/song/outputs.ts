import { Prisma } from '@prisma/client'

export const defaultSongSelect = Prisma.validator<Prisma.SongSelect>()({
  id: true,
  title: true,
})
export type DefaultSong = Prisma.SongGetPayload<{
  select: typeof defaultSongSelect
}>

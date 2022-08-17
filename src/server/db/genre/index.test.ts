import { GenreType } from '@prisma/client'

import { prisma } from '../../prisma'
import { createAccount } from '../account'
import { createGenre, deleteGenre, getSimpleGenres } from '.'

async function flush() {
  const models = Object.keys(prisma).filter((key) => key[0] !== '_')

  const promises = models.map((name) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return prisma[name].deleteMany()
  })

  await prisma.$transaction(promises)
}

afterAll(async () => {
  await flush()
  await prisma.$disconnect()
})

it('should delete a genre with 1 aka', async () => {
  const account = await createAccount({
    username: 'username',
    password: 'password',
  })

  const genre = await createGenre(
    {
      name: 'genre',
      type: GenreType.STYLE,
      akas: [{ name: 'aka', relevance: 2, order: 0 }],
      relevance: 1,
    },
    account.id
  )

  let allGenres = await getSimpleGenres()
  expect(allGenres.length).toBe(1)

  let allAkas = await prisma.genreAka.findMany()
  expect(allAkas.length).toBe(1)

  await deleteGenre(genre.id, account.id)

  allGenres = await getSimpleGenres()
  expect(allGenres.length).toBe(0)

  allAkas = await prisma.genreAka.findMany()
  expect(allAkas.length).toBe(0)
})

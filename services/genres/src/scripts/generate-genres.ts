import { Genre } from '../domain/genre.js'
import { GenreTreeNode } from '../domain/genre-tree-node.js'
import { DrizzleGenreRepository } from '../infrastructure/drizzle-genre-repository.js'
import { DrizzleGenreTreeRepository } from '../infrastructure/drizzle-genre-tree-repository.js'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from '../infrastructure/drizzle-postgres-connection.js'
import { GENRE_TYPES } from '../infrastructure/drizzle-schema.js'

const DEFAULT_COUNT = 10000
const MAX_RELATED_GENRES = 3
const DEFAULT_DB_URL = 'postgres://postgres:postgres@localhost:5432/genres'

type GenreData = {
  name: string
  subtitle?: string
  type: (typeof GENRE_TYPES)[number]
  nsfw: boolean
  shortDescription?: string
  longDescription?: string
  notes?: string
  akas: {
    primary: string[]
    secondary: string[]
    tertiary: string[]
  }
  parents?: Set<number>
  derivedFrom?: Set<number>
  influences?: Set<number>
}

function generateRandomGenre(existingIds: number[] = []): GenreData {
  const adjectiveList = [
    'Ambient',
    'Alternative',
    'Digital',
    'Electronic',
    'Future',
    'Glitch',
    'Heavy',
    'Hyper',
    'Indie',
    'Industrial',
    'Lo-Fi',
    'Modern',
    'Neo',
    'Post',
    'Progressive',
    'Psychedelic',
    'Retro',
    'Synth',
    'Techno',
    'Underground',
    'Urban',
    'Vapor',
    'Virtual',
  ]

  const nounList = [
    'Bass',
    'Beat',
    'Breaks',
    'Core',
    'Dance',
    'Disco',
    'Drone',
    'Funk',
    'Garage',
    'Grime',
    'House',
    'Jazz',
    'Metal',
    'Pop',
    'Punk',
    'Rave',
    'Rock',
    'Soul',
    'Step',
    'Trap',
    'Wave',
  ]

  // Generate a random name
  const adjective = adjectiveList[Math.floor(Math.random() * adjectiveList.length)]!
  const noun = nounList[Math.floor(Math.random() * nounList.length)]!
  const name = `${adjective} ${noun}`

  // Generate some AKAs
  const primaryAkas = Math.random() > 0.7 ? [`${adjective.toLowerCase()}${noun.toLowerCase()}`] : []
  const secondaryAkas = Math.random() > 0.8 ? [`${adjective[0]}${noun}`] : []
  const tertiaryAkas = Math.random() > 0.9 ? [`${adjective}-${noun}`] : []

  // Generate some descriptions
  const shortDescription =
    Math.random() > 0.5
      ? `A fusion of ${adjective.toLowerCase()} sounds with ${noun.toLowerCase()} elements`
      : undefined

  const longDescription =
    Math.random() > 0.7
      ? `${name} emerged in the late ${
          2000 + Math.floor(Math.random() * 20)
        }s as a response to mainstream ${noun}. It features ${adjective.toLowerCase()} elements combined with traditional ${noun.toLowerCase()} structures.`
      : undefined

  // Pick a random genre type
  const type = GENRE_TYPES[Math.floor(Math.random() * GENRE_TYPES.length)]!

  // Create relationships with existing genres
  const parents = new Set<number>()
  const derivedFrom = new Set<number>()
  const influences = new Set<number>()

  if (existingIds.length > 0) {
    // Assign some random parents
    if (Math.random() > 0.5) {
      const count = Math.min(Math.floor(Math.random() * MAX_RELATED_GENRES) + 1, existingIds.length)
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * existingIds.length)
        const id = existingIds[randomIndex]
        if (id !== undefined) {
          parents.add(id)
        }
      }
    }

    // Assign some random derivations
    if (Math.random() > 0.7 && existingIds.length > MAX_RELATED_GENRES) {
      const count = Math.min(Math.floor(Math.random() * MAX_RELATED_GENRES) + 1, existingIds.length)
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * existingIds.length)
        const id = existingIds[randomIndex]
        // Don't add as derivedFrom if already a parent
        if (id !== undefined && !parents.has(id)) {
          derivedFrom.add(id)
        }
      }
    }

    // Assign some random influences
    if (Math.random() > 0.6 && existingIds.length > MAX_RELATED_GENRES) {
      const count = Math.min(Math.floor(Math.random() * MAX_RELATED_GENRES) + 1, existingIds.length)
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * existingIds.length)
        const id = existingIds[randomIndex]
        // Don't add as influence if already a parent or derivedFrom
        if (id !== undefined && !parents.has(id) && !derivedFrom.has(id)) {
          influences.add(id)
        }
      }
    }
  }

  return {
    name,
    subtitle: Math.random() > 0.7 ? `Also known as ${adjective} ${noun.toLowerCase()}` : undefined,
    type,
    nsfw: Math.random() > 0.9, // 10% chance of being NSFW
    shortDescription,
    longDescription,
    notes:
      Math.random() > 0.8 ? `Notable artists include fictional performers A, B, and C.` : undefined,
    akas: {
      primary: primaryAkas,
      secondary: secondaryAkas,
      tertiary: tertiaryAkas,
    },
    parents,
    derivedFrom,
    influences,
  }
}

async function generateGenres(count = DEFAULT_COUNT, dbUrl = DEFAULT_DB_URL) {
  // Connect to database and setup repositories
  let db, connection

  try {
    // Try to use the provided PostgreSQL connection
    connection = getPostgresConnection(dbUrl)
    db = getDbConnection(connection)
    await migrate(db)
    console.log('Connected to PostgreSQL database')
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error)
    process.exit(1)
  }

  const genreRepository = new DrizzleGenreRepository(db)
  const genreTreeRepository = new DrizzleGenreTreeRepository(db)

  console.log(`Generating ${count} random genres...`)

  // Get existing genre tree to establish relationships
  const genreTree = await genreTreeRepository.get()
  const existingIds = [...genreTree.map.keys()]
  console.log(`Found ${existingIds.length} existing genres in the database`)

  // Generate and save the genres
  const createdIds: number[] = []

  for (let i = 0; i < count; i++) {
    // Generate random genre data
    const genreData = generateRandomGenre([...existingIds, ...createdIds])

    // Create the genre domain object
    const genre = Genre.create({
      name: genreData.name,
      subtitle: genreData.subtitle,
      type: genreData.type,
      nsfw: genreData.nsfw,
      shortDescription: genreData.shortDescription,
      longDescription: genreData.longDescription,
      notes: genreData.notes,
      akas: genreData.akas,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    if (genre.isErr()) {
      console.error(`Error creating genre ${genreData.name}:`, genre.error)
      continue
    }

    try {
      // Save the genre
      const { id } = await genreRepository.save(genre.value)
      createdIds.push(id)
      console.log(`Created genre ${i + 1}/${count}: ${genreData.name} (ID: ${id})`)

      // Create and save the genre tree node
      const genreTreeNode = GenreTreeNode.create(
        id,
        genreData.name,
        genreData.parents ?? new Set(),
        genreData.derivedFrom ?? new Set(),
        genreData.influences ?? new Set(),
      )

      if (genreTreeNode.isErr()) {
        console.error(`Error creating genre tree node for ${genreData.name}:`, genreTreeNode.error)
        continue
      }

      genreTree.insertGenre(genreTreeNode.value)
    } catch (error) {
      console.error(`Error saving genre ${genreData.name}:`, error)
    }
  }

  // Save the updated genre tree
  try {
    await genreTreeRepository.save(genreTree)
    console.log(`Successfully updated genre tree with ${createdIds.length} new genres`)
  } catch (error) {
    console.error('Error saving genre tree:', error)
  }

  // Close the database connection
  if ('close' in db) {
    await db.close()
  }

  console.log('Done!')
}

// Parse command line arguments
const args = process.argv.slice(2)
const count = parseInt(args[0] ?? DEFAULT_COUNT.toString())
const dbUrl = args[1] ?? DEFAULT_DB_URL

// Run the generator
generateGenres(count, dbUrl).catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})

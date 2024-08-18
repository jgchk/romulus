import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type ReleaseArtist, releaseArtists } from '../schema'

export default class ReleaseArtistsDatabase {
  findByArtistId(artistId: number, conn: IDrizzleConnection): Promise<ReleaseArtist[]> {
    return conn.query.releaseArtists.findMany({
      where: eq(releaseArtists.artistId, artistId),
    })
  }
}

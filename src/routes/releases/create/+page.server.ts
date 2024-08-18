import { error } from '@sveltejs/kit'

import ArtistsDatabase from '$lib/server/db/controllers/artists'
import ReleasesDatabase from '$lib/server/db/controllers/releases'

import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals }) => {
    if (locals.user?.id !== 1) {
      return error(401, 'Unauthorized')
    }

    const artistsDb = new ArtistsDatabase()
    const [fishmans] = await artistsDb.insert([{ name: 'Fishmans' }], locals.dbConnection)

    const releasesDb = new ReleasesDatabase()
    await releasesDb.insert(
      [
        {
          title: 'Long Season',
          releaseDate: '1996-10-25',
          art: 'https://e.snmc.io/i/fullres/w/248acb3a9afcac173e8c17b94a98b04a/10504082',
          artists: [fishmans.id],
          tracks: [{ title: 'Long Season' }],
        },
        {
          title: '98.12.28 男達の別れ',
          releaseDate: '1999-09-29',
          art: 'https://e.snmc.io/i/fullres/w/6e68293b02a397b90a314a8e983a1412/6123720',
          artists: [fishmans.id],
          tracks: [
            { title: 'Oh Slime' },
            { title: 'ナイトクルージング' },
            { title: 'なんてったの' },
            { title: 'Thank You' },
            { title: '幸せ者' },
            { title: '頼りない天使' },
            { title: 'ひこうき' },
            { title: 'IN THE FLIGHT' },
            { title: 'WALKING IN THE RHYTHM' },
            { title: "Smilin' Days, Summer Holiday" },
            { title: 'MELODY' },
            { title: 'ゆらめき IN THE AIR' },
            { title: 'いかれたBaby' },
            { title: 'LONG SEASON' },
          ],
        },
      ],
      locals.dbConnection,
    )
  },
}

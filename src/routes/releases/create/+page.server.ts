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
    const [fishmans, pierre] = await artistsDb.insert(
      [{ name: 'Fishmans' }, { name: "Pi'erre Bourne" }],
      locals.dbConnection,
    )

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
        {
          title: "The Life of P'erre 4",
          releaseDate: '2019',
          art: 'https://i.discogs.com/FaEwv0AMSOUyJOpj5FYyWEaNlSdJ--k85wv4xxujlh0/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE2MjU3/NDc0LTE2NjI4MzQ2/NjUtMjM0NC5qcGVn.jpeg',
          artists: [pierre.id],
          tracks: [
            { title: 'Poof' },
            { title: 'Try Again' },
            { title: 'Feds' },
            { title: 'Be Mine' },
            { title: 'Ballad' },
            { title: 'Routine' },
            { title: 'Lovers' },
            { title: 'How High' },
            { title: 'Romeo Must Die' },
            { title: 'Racer' },
            { title: 'Stereotypes' },
            { title: 'Doublemint' },
            { title: 'Horoscopes' },
            { title: 'Juice' },
            { title: 'Guillotine' },
            { title: 'Speed Dial' },
          ],
          issues: [
            {
              title: "The Life of P'ierre 4 (Deluxe)",
              releaseDate: '2020',
              art: 'https://i.discogs.com/LB3VziHBPk9OGvVFKyuQewO98r6CJyBURyFb2_KcE2o/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE2MjU3/NjA5LTE2NjI4MzQ2/ODYtMTM2Ny5qcGVn.jpeg',
              artists: [pierre.id],
              tracks: [
                { title: 'Gotta Blast' },
                { title: 'Joe Morris' },
                { title: '4L' },
                { title: "BeBe's Kids" },
                { title: 'Sossgirl' },
                { title: 'Sossboy' },
                { title: 'Deja Vu' },
                { title: 'Purple Genes' },
                { title: 'Conspiracy' },
                { title: 'Motto' },
                { title: 'Growing Pains' },
                { title: 'Jay P' },
                { title: 'Simon Says' },
                { title: 'TBH' },
                { title: 'Fortune Cookie' },
                { title: 'Poof' },
                { title: 'Try Again' },
                { title: 'Feds' },
                { title: 'Be Mine' },
                { title: 'Ballad' },
                { title: 'Routine' },
                { title: 'Lovers' },
                { title: 'How High' },
                { title: 'Romeo Must Die' },
                { title: 'Racer' },
                { title: 'Stereotypes' },
                { title: 'Doublemint' },
                { title: 'Horoscopes' },
                { title: 'Juice' },
                { title: 'Guillotine' },
                { title: 'Speed Dial' },
              ],
            },
          ],
        },
      ],
      locals.dbConnection,
    )
  },
}

import { trpc } from '../utils/trpc'

export const useSpotifyAlbumQuery = (id: string) =>
  trpc.useQuery(['spotify.album', { id }], {
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

export const useSpotifyArtistQuery = (id: string) =>
  trpc.useQuery(['spotify.artist', { id }], {
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

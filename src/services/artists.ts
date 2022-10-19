import { trpc } from '../utils/trpc'

export const useAddArtistMutation = () => {
  return trpc.useMutation(['artist.add'])
}

export const useEditArtistMutation = () => {
  return trpc.useMutation(['artist.edit'])
}

export const useDeleteArtistMutation = () => {
  return trpc.useMutation(['artist.delete'])
}

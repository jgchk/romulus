import { DefaultArtist } from '../server/db/artist/outputs'
import { PersonNameStringArg, toPersonNameString } from './people'

export const toArtistNameString = (
  artist: Pick<DefaultArtist, 'name' | 'members'>
) =>
  artist.name ??
  artist.members.map((member) => toMemberNameString(member)).join(', ')

export const toMemberNameString = (member: {
  name: DefaultArtist['members'][number]['name']
  person: PersonNameStringArg
}) => member.name ?? toPersonNameString(member.person)

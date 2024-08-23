import type { MultiselectProps } from '$lib/atoms/Multiselect'
import type { Artist } from '$lib/server/db/schema'

export type ArtistMultiselectProps = Omit<MultiselectProps<number>, 'options'>

export type MultiselectArtist = Pick<Artist, 'id' | 'name'>

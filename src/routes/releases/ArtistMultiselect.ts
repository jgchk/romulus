import type { MultiselectProps } from '$lib/atoms/Multiselect'

export type ArtistMultiselectProps = Omit<MultiselectProps<{ id: number; name: string }>, 'options'>

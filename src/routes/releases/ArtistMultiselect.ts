import type { MultiselectProps } from '$lib/atoms/Multiselect'

export type ArtistMultiselectProps = Omit<
  MultiselectProps<{ id: number; name: string }>,
  'options' | 'onChange' | 'selected' | 'option'
> & { onChange?: (value: { id: number; name: string }[]) => void }

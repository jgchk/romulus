import type { MultiselectProps } from '$lib/atoms/Multiselect'

export type GenreMultiselectProps = Omit<MultiselectProps<unknown>, 'value' | 'options'> & {
  value: number[]
  exclude?: number[]
  onChange?: (value: number[]) => void
}

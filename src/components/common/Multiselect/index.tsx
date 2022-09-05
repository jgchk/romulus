import {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
} from 'react'

import useForwardedRef from '../../../hooks/useForwardedRef'
import MultiselectBox from './box'
import { HasId, MultiselectProvider } from './context'
import MultiselectInput from './input'
import MultiselectOption from './option'
import MultiselectOptions from './options'
import MultiselectSelected from './selected'

type MultiselectProps<T> = {
  options: T[] | undefined
  value: T[]
  onChange: (value: T[]) => void
  query: string
  onQueryChange: (query: string) => void
}

const Multiselect = <T extends HasId>(
  {
    children,
    options,
    value,
    onChange,
    query,
    onQueryChange,
  }: PropsWithChildren<MultiselectProps<T>>,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const innerRef = useForwardedRef(ref)
  return (
    <MultiselectProvider
      options={options}
      selected={value}
      onChange={onChange as (value: HasId[]) => void}
      inputRef={innerRef.current}
      setInputRef={(val) => {
        innerRef.current = val
      }}
      query={query}
      onQueryChange={onQueryChange}
    >
      {children}
    </MultiselectProvider>
  )
}

const Wrapper = forwardRef(Multiselect) as unknown as (<T extends HasId>(
  props: PropsWithChildren<MultiselectProps<T>> & {
    ref?: ForwardedRef<HTMLInputElement>
  }
) => ReactElement) & {
  Box: typeof MultiselectBox
  Selected: typeof MultiselectSelected
  Input: typeof MultiselectInput
  Options: typeof MultiselectOptions
  Option: typeof MultiselectOption
}

Wrapper.Box = MultiselectBox
Wrapper.Selected = MultiselectSelected
Wrapper.Input = MultiselectInput
Wrapper.Options = MultiselectOptions
Wrapper.Option = MultiselectOption

export default Wrapper

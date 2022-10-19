import {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react'

import useForwardedRef from '../../../hooks/useForwardedRef'
import { twsx } from '../../../utils/dom'
import Popover from '../Popover'
import MultiselectBox from './box'
import { HasId, MultiselectContext } from './context'
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
  children: [ReactNode, ReactNode]
  className?: string
}

const Multiselect = <T extends HasId>(
  {
    children,
    options,
    value,
    onChange,
    query,
    onQueryChange,
    className,
  }: PropsWithChildren<MultiselectProps<T>>,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const innerRef = useForwardedRef(ref)
  const select = useCallback(
    (item: T) => onChange([...value, item]),
    [onChange, value]
  )

  const unselect = useCallback(
    (item: T) => onChange(value.filter((i) => i.id !== item.id)),
    [onChange, value]
  )

  const [open, setOpen] = useState(false)

  const contextValue: MultiselectContext = useMemo(
    () => ({
      open,
      setOpen,
      options,
      selected: value,
      onChange: onChange as (value: HasId[]) => void,
      select: select as (item: HasId) => void,
      unselect: unselect as (item: HasId) => void,
      inputRef: innerRef.current,
      setInputRef: (val) => {
        innerRef.current = val
      },
      query,
      onQueryChange,
    }),
    [
      innerRef,
      onChange,
      onQueryChange,
      open,
      options,
      query,
      select,
      unselect,
      value,
    ]
  )

  return (
    <MultiselectContext.Provider value={contextValue}>
      <Popover show={open}>
        <div className={twsx('relative', className)}>{children}</div>
      </Popover>
    </MultiselectContext.Provider>
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

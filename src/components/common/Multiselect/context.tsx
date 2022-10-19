import {
  createContext,
  Dispatch,
  FC,
  Key,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react'

export type HasId = { id: Key }

export type MultiselectContext = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>

  options: HasId[] | undefined
  selected: HasId[]

  onChange: (value: HasId[]) => void
  select: (item: HasId) => void
  unselect: (item: HasId) => void

  inputRef: HTMLInputElement | null
  setInputRef: (inputRef: HTMLInputElement) => void

  query: string
  onQueryChange: (query: string) => void
}

const placeholderFn = () => {
  throw new Error(
    'MultiselectContext must be used inside a MultiselectProvider'
  )
}

export const MultiselectContext = createContext<MultiselectContext>({
  open: false,
  setOpen: placeholderFn,

  options: [],
  selected: [],

  onChange: placeholderFn,
  select: placeholderFn,
  unselect: placeholderFn,

  inputRef: null,
  setInputRef: placeholderFn,

  query: '',
  onQueryChange: placeholderFn,
})

export const MultiselectProvider: FC<
  PropsWithChildren<
    Pick<
      MultiselectContext,
      | 'options'
      | 'selected'
      | 'onChange'
      | 'inputRef'
      | 'setInputRef'
      | 'query'
      | 'onQueryChange'
    >
  >
> = ({ children, onChange, selected, ...props }) => {
  const select = useCallback(
    (item: HasId) => onChange([...selected, item]),
    [onChange, selected]
  )

  const unselect = useCallback(
    (item: HasId) => onChange(selected.filter((i) => i.id !== item.id)),
    [onChange, selected]
  )

  const [open, setOpen] = useState(false)

  return (
    <MultiselectContext.Provider
      value={{
        ...props,
        onChange,
        selected,
        select,
        unselect,
        open,
        setOpen,
      }}
    >
      {children}
    </MultiselectContext.Provider>
  )
}

export const useMultiselectContext = () => useContext(MultiselectContext)

import { FC, useEffect, useMemo } from 'react'

import { useInputGroupContext } from '../InputGroup'
import { useMultiselectContext } from './context'

export type MultiselectInputProps = {
  id?: string
  placeholder?: string
}

const MultiselectInput: FC<MultiselectInputProps> = ({
  id: propsId,
  placeholder,
}) => {
  const {
    open,
    setOpen,
    options,
    selected,
    select,
    unselect,
    setInputRef,
    query,
    onQueryChange,
  } = useMultiselectContext()

  const { id: contextId } = useInputGroupContext()
  const id = useMemo(() => propsId ?? contextId, [contextId, propsId])

  useEffect(() => {
    if (query.length > 0) {
      setOpen(true)
    }
  }, [query.length, setOpen])

  return (
    <input
      ref={setInputRef}
      id={id}
      className='w-full bg-transparent text-sm text-gray-800 outline-none placeholder:italic placeholder:text-gray-700'
      placeholder={placeholder}
      autoComplete='off'
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Tab' || e.key === 'Enter') {
          if (!open && query.length === 0) {
            return
          }

          const topOption = options?.[0]
          if (topOption === undefined) {
            setOpen(false)
            return
          }

          e.preventDefault()
          select(topOption)
          onQueryChange('')
          setOpen(false)
        } else if (
          e.key === 'Backspace' &&
          query.length === 0 &&
          selected.length > 0
        ) {
          e.preventDefault()
          unselect(selected[selected.length - 1])
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setOpen(false)
        }
      }}
    />
  )
}

export default MultiselectInput

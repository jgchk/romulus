import { FC, useMemo } from 'react'

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

  return (
    <input
      ref={setInputRef}
      id={id}
      className='flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:italic placeholder:text-gray-700'
      placeholder={placeholder}
      autoComplete='off'
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Tab' || e.key === 'Enter') {
          const topOption = options?.[0]
          if ((query.length === 0 && !open) || topOption === undefined) {
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
        }
      }}
    />
  )
}

export default MultiselectInput

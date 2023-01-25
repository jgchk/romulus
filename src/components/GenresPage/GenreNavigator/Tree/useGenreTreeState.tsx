import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

type GenreTreeStateContext = {
  selectedPath: number[] | undefined
  setSelectedPath: (path: number[] | undefined) => void
  expanded: Expanded
  setExpanded: (key: ExpandedKey, value: ExpandedValue) => void
  collapseAll: () => void
}

type Expanded = Record<ExpandedKey, ExpandedValue | undefined>
type ExpandedKey = string
type ExpandedValue = 'expanded' | 'collapsed'

const fnPlaceholder = () => {
  throw new Error(
    'GenreTreeStateContext must be used inside a GenreTreeStateProvider'
  )
}

const GenreTreeStateContext = createContext<GenreTreeStateContext>({
  selectedPath: undefined,
  setSelectedPath: fnPlaceholder,
  expanded: {},
  setExpanded: fnPlaceholder,
  collapseAll: fnPlaceholder,
})

export const useGenreTreeState = () => useContext(GenreTreeStateContext)

export const GenreTreeStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [selectedPath, setSelectedPath] = useState<number[]>()

  const [expanded, setExpanded] = useState<Expanded>({})
  const setExpandedKV = useCallback(
    (
      key: ExpandedKey,
      value:
        | ExpandedValue
        | ((value: ExpandedValue | undefined) => ExpandedValue)
    ) =>
      setExpanded((e) => {
        const oldValue = e[key]
        const newValue = typeof value === 'function' ? value(oldValue) : value
        return oldValue === newValue ? e : { ...e, [key]: newValue }
      }),
    []
  )
  const collapseAll = useCallback(() => setExpanded({}), [])

  useEffect(() => {
    if (selectedPath) {
      for (let i = 1; i < selectedPath.length; i++) {
        const key = selectedPath.slice(0, i).join('-')
        setExpandedKV(key, 'expanded')
      }
    }
  }, [selectedPath, setExpandedKV])

  return (
    <GenreTreeStateContext.Provider
      value={{
        selectedPath,
        setSelectedPath: setSelectedPath,
        expanded,
        setExpanded: setExpandedKV,
        collapseAll,
      }}
    >
      {children}
    </GenreTreeStateContext.Provider>
  )
}

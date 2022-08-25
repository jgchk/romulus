import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react'

type Expanded = Record<string, 'expanded' | 'collapsed' | undefined>

type ExpandedContext = [Expanded, Dispatch<SetStateAction<Expanded>>]

const ExpandedContext = createContext<ExpandedContext>([
  {},
  () => {
    throw new Error('Must use TreeContext inside of a TreeProvider')
  },
])

export const ExpandedGenresProvider: FC<PropsWithChildren> = ({ children }) => {
  const [expanded, setExpanded] = useState<Expanded>({})

  return (
    <ExpandedContext.Provider value={[expanded, setExpanded]}>
      {children}
    </ExpandedContext.Provider>
  )
}

export const useExpandedGenres = () => useContext(ExpandedContext)

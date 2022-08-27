import { createContext, FC, PropsWithChildren, useContext } from 'react'

type GenreTreeRefContext = HTMLDivElement | null

const GenreTreeRefContext = createContext<GenreTreeRefContext>(null)

export const GenreTreeRefProvider: FC<
  PropsWithChildren<{ treeEl: HTMLDivElement | null }>
> = ({ children, treeEl }) => {
  return (
    <GenreTreeRefContext.Provider value={treeEl}>
      {children}
    </GenreTreeRefContext.Provider>
  )
}

export const useGenreTreeRef = () => useContext(GenreTreeRefContext)

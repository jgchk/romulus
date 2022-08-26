import { createContext, FC, PropsWithChildren, useContext } from 'react'

type GenreTreeContext = {
  treeEl: HTMLDivElement | null
}

const GenreTreeContext = createContext<GenreTreeContext>({
  treeEl: null,
})

export const GenreTreeProvider: FC<
  PropsWithChildren<{ treeEl: HTMLDivElement | null }>
> = ({ children, treeEl }) => {
  return (
    <GenreTreeContext.Provider value={{ treeEl }}>
      {children}
    </GenreTreeContext.Provider>
  )
}

export const useGenreTreeContext = () => useContext(GenreTreeContext)

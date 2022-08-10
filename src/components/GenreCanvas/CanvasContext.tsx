import { createContext, FC, PropsWithChildren, useContext } from 'react'

import { DefaultGenre } from '../../server/db/genre/types'

type CanvasContext = {
  activeId?: number
  activeGenre?: DefaultGenre
}

const CanvasContext = createContext<CanvasContext>({
  activeId: undefined,
  activeGenre: undefined,
})

export const CanvasContextProvider: FC<PropsWithChildren<CanvasContext>> = ({
  children,
  ...value
}) => <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>

export const useCanvasContext = () => useContext(CanvasContext)

import { useRouter } from 'next/router'
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react'

import CreateGenreDialog from '../CreateGenreDialog'
import EditGenreDialog from '../EditGenreDialog'
import { GenreFormFields } from '../GenreForm'

export type DialogState =
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'create' }

const DialogContext = createContext<
  [DialogState | null, Dispatch<SetStateAction<DialogState | null>>]
>([
  null,
  () => {
    throw new Error('You must use DialogContext inside of a DialogProvider')
  },
])

export const DialogProvider: FC<PropsWithChildren> = ({ children }) => {
  const value = useState<DialogState | null>(null)

  const [dialogState, setDialogState] = value

  const router = useRouter()

  return (
    <DialogContext.Provider value={value}>
      <>
        {children}

        {dialogState && dialogState.type === 'create' && (
          <CreateGenreDialog
            onClose={() => setDialogState(null)}
            onCreate={(genre) => router.push(`/genres/${genre.id}`)}
          />
        )}
        {dialogState && dialogState.type === 'edit' && (
          <EditGenreDialog
            id={dialogState.id}
            onClose={() => setDialogState(null)}
            autoFocus={dialogState.autoFocus}
          />
        )}
      </>
    </DialogContext.Provider>
  )
}

export const useDialogState = () => useContext(DialogContext)

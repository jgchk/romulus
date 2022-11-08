import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from 'react'
import { FieldError, Merge } from 'react-hook-form'

import InputError from './InputError'
import Label from './Label'

type InputGroupContext = {
  id: string | undefined
  error:
    | FieldError
    | Merge<FieldError, (FieldError | undefined)[]>
    | string
    | undefined
}
const InputGroupContext = createContext<InputGroupContext>({
  id: undefined,
  error: undefined,
})
export const useInputGroupContext = () => useContext(InputGroupContext)

const InputGroup: FC<
  PropsWithChildren<{
    id?: string
    error?: FieldError | Merge<FieldError, (FieldError | undefined)[]> | string
    label?: ReactNode
    required?: boolean
  }>
> = ({ id, error, label, required, children }) => {
  const errorMessage = useMemo(() => {
    if (!error) return
    if (typeof error === 'string') return error
    if (error.message) return error.message
    if ('find' in error) return error.find?.((e) => e && e.message)?.message
  }, [error])

  return (
    <InputGroupContext.Provider value={{ id, error }}>
      <div>
        {(label || required) && (
          <div className='mb-0.5 flex'>
            {label && (
              <Label className='self-start' htmlFor={id}>
                {label}
              </Label>
            )}
            <div className='flex-1' />
            {required && (
              <div className='self-end text-xs italic text-gray-700'>
                Required
              </div>
            )}
          </div>
        )}
        {children}
        {errorMessage && (
          <InputError className='mt-0.5'>{errorMessage}</InputError>
        )}
      </div>
    </InputGroupContext.Provider>
  )
}

export default InputGroup

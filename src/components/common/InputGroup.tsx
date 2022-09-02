import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
} from 'react'
import { FieldError } from 'react-hook-form'

import InputError from './InputError'
import Label from './Label'

type InputGroupContext = {
  id: string | undefined
  error: FieldError | string | undefined
}
const InputGroupContext = createContext<InputGroupContext>({
  id: undefined,
  error: undefined,
})
export const useInputGroupContext = () => useContext(InputGroupContext)

const InputGroup: FC<
  PropsWithChildren<{
    id?: string
    error?: FieldError | string
    label?: ReactNode
    required?: boolean
  }>
> = ({ id, error, label, required, children }) => (
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
      {error && (
        <InputError className='mt-0.5'>
          {typeof error === 'string' ? error : error.message}
        </InputError>
      )}
    </div>
  </InputGroupContext.Provider>
)

export default InputGroup

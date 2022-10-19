import { Transition } from '@headlessui/react'
import { SetStateAction } from 'jotai'
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { usePopper } from 'react-popper'

import { twsx } from '../../utils/dom'

type PopoverContext = {
  show: boolean
  referenceElement: HTMLDivElement | null
  setReferenceElement: Dispatch<SetStateAction<HTMLDivElement | null>>
}

const PopoverContext = createContext<PopoverContext>({
  show: false,
  referenceElement: null,
  setReferenceElement: () => {
    throw new Error('Must use within a PopoverContext provider')
  },
})

const PopoverParent: FC<PropsWithChildren<{ show: boolean }>> = ({
  show,
  children,
}) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null)

  const value: PopoverContext = useMemo(
    () => ({ show, referenceElement, setReferenceElement }),
    [referenceElement, show]
  )

  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  )
}

const PopoverTarget: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  const { setReferenceElement } = useContext(PopoverContext)

  return (
    <div className={className} ref={setReferenceElement}>
      {children}
    </div>
  )
}

const PopoverContent: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  const { show, referenceElement } = useContext(PopoverContext)

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  )

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'offset', options: { offset: [0, 6] } }],
  })

  return (
    <Transition
      show={show}
      enter='transition-opacity'
      enterFrom='opacity-0'
      enterTo='opacity-100'
      leave='transition-opacity'
      leaveFrom='opacity-100'
      leaveTo='opacity-0'
      ref={setPopperElement}
      style={styles.popper}
      className={twsx('z-10', className)}
      {...attributes.popper}
    >
      {children}
    </Transition>
  )
}

const Wrapper = PopoverParent as unknown as typeof PopoverParent & {
  Target: typeof PopoverTarget
  Content: typeof PopoverContent
}
Wrapper.Target = PopoverTarget
Wrapper.Content = PopoverContent

export default Wrapper

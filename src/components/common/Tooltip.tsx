import { Transition } from '@headlessui/react'
import { FC, PropsWithChildren, ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'

import useDebounce from '../../hooks/useDebounce'

const Tooltip: FC<
  PropsWithChildren<{ className?: string; tip: ReactNode }>
> = ({ className, tip, children }) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  )
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: 'arrow',
        options: { element: arrowElement },
      },
      { name: 'offset', options: { offset: [0, 6] } },
    ],
  })

  const [show, setShow] = useState(false)
  const [showDebounced] = useDebounce(show, 500)

  useEffect(() => {
    if (!referenceElement) return

    const onEnterListener = () => setShow(true)
    const onExitListener = () => setShow(false)

    referenceElement.addEventListener('mouseenter', onEnterListener)
    referenceElement.addEventListener('mouseleave', onExitListener)

    return () => {
      referenceElement.removeEventListener('mouseenter', onEnterListener)
      referenceElement.removeEventListener('mouseleave', onExitListener)
    }
  }, [referenceElement])

  return (
    <div className={className} ref={setReferenceElement}>
      {children}
      {createPortal(
        <Transition
          show={showDebounced}
          enter='transition-opacity'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition-opacity'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
          className='tooltip rounded bg-gray-900 px-1.5 py-1 text-xs font-medium text-gray-100 shadow'
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {tip}
          <div
            className='arrow h-1 w-1 before:absolute before:h-1 before:w-1 before:rotate-45 before:bg-gray-900'
            ref={setArrowElement}
            style={styles.arrow}
          />
        </Transition>,
        document.body
      )}
    </div>
  )
}

export default Tooltip

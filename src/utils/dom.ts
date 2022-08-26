import clsx, { ClassValue } from 'clsx'
import toast from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

export const findAncestorNode = (
  start: Node,
  cb: (node: Node) => boolean
): Node | null => {
  let current: Node | null = start
  while (current && !cb(current)) {
    current = current.parentNode
  }
  return current
}

export const findAncestorElement = (
  start: HTMLElement,
  cb: (node: HTMLElement) => boolean
): HTMLElement | null => {
  let current: HTMLElement | null = start
  while (current && !cb(current)) {
    current = current.parentElement
  }
  return current
}

export const isBrowser = typeof window !== 'undefined'

const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.append(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    const msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
  } catch (error) {
    console.error('Fallback: Oops, unable to copy', error)
  }

  textArea.remove()
}

export const copyTextToClipboard = (text: string, showToast = true) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }

  navigator.clipboard.writeText(text).then(
    () => {
      if (showToast) {
        toast.success('Copied to clipboard!')
      }
    },
    () => {
      if (showToast) {
        toast.error('Could not copy to clipboard')
      }
    }
  )
}

export const twsx = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const isVisible = (ele: HTMLElement, container: HTMLElement) => {
  const rect = ele.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  // if rect is above container
  if (rect.top <= containerRect.top) {
    // check that some of bottom intersects
    return containerRect.top - rect.top <= rect.height
  }

  // check that some of top intersects
  return rect.bottom - containerRect.bottom <= rect.height
}

export const isFullyVisible = (ele: HTMLElement, container: HTMLElement) => {
  const rect = ele.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  // if rect is above container
  if (rect.top <= containerRect.top) {
    // check that some of bottom intersects
    return containerRect.top - rect.top <= 0
  }

  // check that some of top intersects
  return rect.bottom - containerRect.bottom <= 0
}

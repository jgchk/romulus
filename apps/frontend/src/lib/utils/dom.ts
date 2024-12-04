import { twMerge } from 'tailwind-merge'

import { toast } from '$lib/atoms/Toast/toast'

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

export const cn = (...args: (string | false | undefined)[]) => args.filter(Boolean).join(' ')
export const tw = twMerge

export const unfocus = () => {
  const docSel = document.getSelection()
  if (docSel) {
    docSel.empty()
  } else {
    window.getSelection()?.removeAllRanges()
  }
}

export function copyTextToClipboard(text: string, showToast = true) {
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
    },
  )
}

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

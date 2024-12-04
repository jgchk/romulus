import type { Instance, Props as TippyProps } from 'tippy.js'
import tippy from 'tippy.js'

import type { Action } from './types'

export type TooltipProps = Partial<TippyProps> & { enabled?: boolean }

const TooltipDefaults = {
  arrow: true,
  duration: 100,
  delay: 300,
  enabled: true,
  touch: false,
  role: 'tooltip',
} as const
const injectDefaultParams = (params: TooltipProps): TooltipProps => ({
  ...params,
  arrow: params.arrow ?? TooltipDefaults.arrow,
  duration: params.duration ?? TooltipDefaults.duration,
  delay: params.delay ?? TooltipDefaults.delay,
  enabled: params.enabled ?? TooltipDefaults.enabled,
  touch: params.touch ?? TooltipDefaults.touch,
  role: params.role ?? TooltipDefaults.role,
})

export const tooltip: Action<TooltipProps> = (node, params) => {
  let tip: Instance<TippyProps> | undefined

  const updateTip = ({ enabled, ...params }: TooltipProps) => {
    if (enabled) {
      if (!tip) {
        tip = tippy(node, params)
      } else {
        tip.setProps(params)
      }
    } else {
      destroyTip()
    }
  }

  const destroyTip = () => {
    tip?.destroy()
    tip = undefined
  }

  updateTip(injectDefaultParams(params))

  return {
    update: (newParams) => {
      updateTip(injectDefaultParams(newParams))
    },
    destroy: () => {
      destroyTip()
    },
  }
}

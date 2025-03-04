import { cubicOut } from 'svelte/easing'
import type { EasingFunction, TransitionConfig } from 'svelte/transition'

type SlideProps = {
  delay?: number
  duration?: number
  easing?: EasingFunction
  axis?: 'x' | 'y'
  opacitySpeed?: number
}

export function slide(
  node: Element,
  { delay = 0, duration = 200, easing = cubicOut, axis = 'x', opacitySpeed = 2 }: SlideProps = {},
): TransitionConfig {
  const style = getComputedStyle(node)
  const opacity = +style.opacity
  const primary_dimension = axis === 'y' ? 'height' : 'width'
  const primary_dimension_value = parseFloat(style[primary_dimension])
  const secondary_dimensions = axis === 'y' ? ['Top', 'Bottom'] : ['Left', 'Right']
  const padding_start_value = parseFloat(style.padding + secondary_dimensions[0])
  const padding_end_value = parseFloat(style.padding + secondary_dimensions[1])
  const margin_start_value = parseFloat(style.margin + secondary_dimensions[0])
  const margin_end_value = parseFloat(style.margin + secondary_dimensions[1])

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const border_width_start_value = parseFloat(style[`border${secondary_dimensions[0]}Width`])
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const border_width_end_value = parseFloat(style[`border${secondary_dimensions[1]}Width`])

  return {
    delay,
    duration,
    easing,
    css: (t) =>
      'overflow: hidden;' +
      `opacity: ${Math.min(t * opacitySpeed, 1) * opacity};` +
      `${primary_dimension}: ${t * primary_dimension_value}px;` +
      `padding-${secondary_dimensions[0].toLowerCase()}: ${t * padding_start_value}px;` +
      `padding-${secondary_dimensions[1].toLowerCase()}: ${t * padding_end_value}px;` +
      `margin-${secondary_dimensions[0].toLowerCase()}: ${t * margin_start_value}px;` +
      `margin-${secondary_dimensions[1].toLowerCase()}: ${t * margin_end_value}px;` +
      `border-${secondary_dimensions[0].toLowerCase()}-width: ${t * border_width_start_value}px;` +
      `border-${secondary_dimensions[1].toLowerCase()}-width: ${t * border_width_end_value}px;`,
  }
}

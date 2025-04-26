import { render } from '@testing-library/svelte'
import type { ComponentProps } from 'svelte'
import { expect, it } from 'vitest'

import DelayTest from './Delay.test.svelte'

function setup(props: ComponentProps<typeof DelayTest>) {
  const returned = render(DelayTest, { props })

  const getChildElement = () => returned.getByTestId('child')
  const queryChildElement = () => returned.queryByTestId('child')

  return {
    ...returned,
    getChildElement,
    queryChildElement,
  }
}

it('should not display the child element immediately', () => {
  const { queryChildElement } = setup({ delay: 100 })
  expect(queryChildElement()).toBeNull()
})

it('should display the child element immediately if delay is 0', () => {
  const { getChildElement } = setup({ delay: 0 })
  expect(getChildElement()).toBeVisible()
})

it('should display the child element after the delay', async () => {
  const { queryChildElement, getChildElement } = setup({ delay: 100 })

  await expectChildElementAfterDelay(100, queryChildElement, getChildElement)
})

it('should default to a 500ms delay', async () => {
  const { queryChildElement, getChildElement } = setup({})

  await expectChildElementAfterDelay(500, queryChildElement, getChildElement)
})

it('should immediately start showing the child element if the delay is updated to 0', async () => {
  const { getChildElement, queryChildElement, rerender } = setup({ delay: 100 })

  expect(queryChildElement()).toBeNull()

  await rerender({ delay: 0 })

  expect(getChildElement()).toBeVisible()
})

it('should update the delay timer if the delay is updated', async () => {
  const { getChildElement, queryChildElement, rerender } = setup({ delay: 1000 })

  expect(queryChildElement()).toBeNull()

  await rerender({ delay: 100 })

  await expectChildElementAfterDelay(100, queryChildElement, getChildElement)
})

async function expectChildElementAfterDelay(
  delay: number,
  queryChildElement: () => HTMLElement | null,
  getChildElement: () => HTMLElement,
) {
  await new Promise((resolve) => setTimeout(resolve, delay - 10))

  expect(queryChildElement()).toBeNull()

  await new Promise((resolve) => setTimeout(resolve, 10))

  expect(getChildElement()).toBeVisible()
}

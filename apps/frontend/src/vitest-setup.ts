import './app.css'

import * as matchers from '@testing-library/jest-dom/matchers'
import { expect, test as base, vi } from 'vitest'

expect.extend(matchers)

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-definitions
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      matchers.TestingLibraryMatchers<T, void> {}
}

export const test = base.extend<{ withSystemTime: (time: Date) => void }>({
  // eslint-disable-next-line no-empty-pattern
  withSystemTime: async ({}, use) => {
    const withSystemTime = (time: Date) => {
      vi.useFakeTimers()
      vi.setSystemTime(time)
    }

    await use(withSystemTime)

    vi.useRealTimers()
  },
})

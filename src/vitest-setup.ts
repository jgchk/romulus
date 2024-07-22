import './app.css'

import * as matchers from '@testing-library/jest-dom/matchers'
import { afterEach, beforeEach, expect, vi } from 'vitest'

expect.extend(matchers)

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      matchers.TestingLibraryMatchers<T, void> {}
}

beforeEach(() => {
  const raf = (fn: (date: Date) => void) => setTimeout(() => fn(new Date()), 16)
  vi.stubGlobal('requestAnimationFrame', raf)
})

// Alternatively, set `unstubGlobals: true` in vitest.config.js
afterEach(() => {
  vi.unstubAllGlobals()
})

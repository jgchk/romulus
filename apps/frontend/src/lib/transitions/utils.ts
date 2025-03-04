export function disableTransitionInUnitTests(duration: number) {
  // Svelte 5 uses the Web Aniimations API for transitions, which is not available in JSDOM
  // or happy-dom. For testing, we simply return an empty object to skip the transition.
  // See here for more details: https://github.com/testing-library/svelte-testing-library/issues/416
  if (import.meta.env.NODE_ENV === 'test') {
    return 0
  }

  return duration
}

export const sortBy = <T, O>(array: T[], accessor: (t: T) => O, compare: (a: O, b: O) => number) =>
  array.sort((a, b) => compare(accessor(a), accessor(b)))

export function range(start: number, stop?: number, step: number = 1): number[] {
  // If only one argument is provided, we assume it is the stop value, and start should be 0.
  if (stop === undefined) {
    stop = start
    start = 0
  }

  const result: number[] = []

  // Calculate the correct direction for stepping.
  if (step > 0) {
    for (let i = start; i < stop; i += step) {
      result.push(i)
    }
  } else {
    for (let i = start; i > stop; i += step) {
      result.push(i)
    }
  }

  return result
}

export const countBy = <T, O>(array: T[], accessor: (t: T) => O): Map<O, number> => {
  const counts = new Map<O, number>()
  for (const item of array) {
    const key = accessor(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

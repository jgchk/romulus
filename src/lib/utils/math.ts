export const median = (arr: number[]) => arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)]

export const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0)

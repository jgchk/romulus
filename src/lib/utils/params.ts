export function getIntParam(url: URL, name: string): number | undefined {
  const stringValue = url.searchParams.get(name)
  const value = stringValue === null ? undefined : parseInt(stringValue, 10)
  if (value === undefined || isNaN(value)) {
    return undefined
  }
  return value
}

export function getStringParam(url: URL, name: string): string | undefined {
  const value = url.searchParams.get(name)
  if (value === null) {
    return undefined
  }
  return value
}

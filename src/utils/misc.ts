let idCounter = 0

export const uniqueId = () => {
  const id = ++idCounter
  return id
}

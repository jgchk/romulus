export type UpdateData<T> = Partial<Omit<T, 'id'>>
export const makeUpdate = <T extends UpdateData<T>>(data: T): T =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as T

export const hasUpdate = <T extends UpdateData<T>>(data: T): boolean =>
  Object.values(data).some((value) => value !== undefined)

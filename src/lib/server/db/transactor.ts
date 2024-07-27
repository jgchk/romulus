export type ITransactor<T> = {
  transaction<O>(fn: (tx: T) => Promise<O>): Promise<O>
}

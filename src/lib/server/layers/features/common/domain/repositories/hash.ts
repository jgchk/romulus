export type HashRepository = {
  hash(input: string): Promise<string>
  compare(input: string, hash: string): Promise<boolean>
}

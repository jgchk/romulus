export type IIdGenerator = {
  generate(): number | Promise<number>
}

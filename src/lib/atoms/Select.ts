export type OptionValue = string | number | symbol
export type OptionData = { value: OptionValue }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Option<T extends OptionData> = T extends { data: any }
  ? DataOption<T['value'], T['data']>
  : PlainOption<T['value']>
export type PlainOption<V extends OptionValue> = {
  value: V
  label: string
}
export type DataOption<V extends OptionValue, Data> = {
  value: V
  label: string
  data: Data
}

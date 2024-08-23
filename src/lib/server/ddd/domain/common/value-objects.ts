export class Order {
  constructor(public value: number) {
    if (value < 0) throw new Error('Order must be non-negative')
  }
}

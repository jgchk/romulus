export type MainTreeManagerEvent = MainMediaTypeTreeSetEvent

export class MainMediaTypeTreeSetEvent {
  constructor(
    public readonly mediaTypeTreeId: string,
    public readonly userId: number,
  ) {}
}

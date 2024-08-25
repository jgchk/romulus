export class NewSession {
  constructor(public accountId: number) {}
}

export class CreatedSession extends NewSession {
  constructor(
    public id: string,
    public accountId: number,
    public wasJustExtended = false,
  ) {
    super(accountId)
  }
}

export class ApiKey {
  constructor(
    public readonly name: string,
    public readonly accountId: number,
    public readonly keyHash: string,
  ) {}
}

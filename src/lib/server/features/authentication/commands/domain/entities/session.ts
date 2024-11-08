export class Session {
  constructor(
    public accountId: number,
    public tokenHash: string,
    public expiresAt: Date,
  ) {}
}

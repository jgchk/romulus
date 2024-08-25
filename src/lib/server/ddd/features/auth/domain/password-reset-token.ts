export class PasswordResetToken {
  constructor(
    public accountId: number,
    public tokenHash: string,
    public expiresAt: Date,
  ) {}

  isExpired() {
    return Date.now() >= this.expiresAt.getTime()
  }
}

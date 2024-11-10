export class Cookie {
  constructor(
    public name: string,
    public value: string,
    public attributes: CookieAttributes,
  ) {}
}

export type CookieAttributes = {
  secure?: boolean
  path?: string
  domain?: string
  sameSite?: 'lax' | 'strict' | 'none'
  httpOnly?: boolean
  maxAge?: number
  expires?: Date
}

export class CookieCreator {
  constructor(
    private cookieName: string,
    private secure: boolean,
  ) {}

  create(session: { token: string; expiresAt: Date } | undefined): Cookie {
    if (session === undefined) {
      return new Cookie(this.cookieName, '', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
        secure: this.secure,
      })
    }

    return new Cookie(this.cookieName, session.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: session.expiresAt,
      path: '/',
      secure: this.secure,
    })
  }
}

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

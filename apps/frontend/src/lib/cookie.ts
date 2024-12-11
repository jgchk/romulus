import type { Cookies } from '@sveltejs/kit'

const SESSION_COOKIE_NAME = 'auth_session'
const IS_SECURE = process.env.NODE_ENV === 'production'

function getSessionCookieOptions({
  secure = IS_SECURE,
  expires,
}: {
  secure?: boolean
  expires: Date
}) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    expires,
    path: '/',
    secure,
  } as const
}

export function setSessionCookie(
  { secure = IS_SECURE, expires, token }: { secure?: boolean; expires: Date; token: string },
  cookies: Cookies,
) {
  cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions({ secure, expires }))
}

export function getSessionCookie(cookies: Cookies) {
  return cookies.get(SESSION_COOKIE_NAME)
}

export function deleteSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' })
}

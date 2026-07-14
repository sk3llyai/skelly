import type { CookieOptions } from 'express';

/** Name of the cookie holding the WorkOS sealed session. */
export const SESSION_COOKIE = 'skelly_session';

/** Cookie options for the session: httpOnly, same-site, secure in production. */
export function sessionCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  };
}

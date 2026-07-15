import type { CookieOptions } from 'express';

/** Name of the cookie holding the WorkOS sealed session. */
export const SESSION_COOKIE = 'skelly_session';

/**
 * Cookie options for the session.
 *
 * In production the web app and API are served from different origins, so the session
 * cookie must be `SameSite=None; Secure` to be sent on the web app's cross-site requests
 * to the API (e.g. `GET /auth/me`). Locally (same-site, plain HTTP) we use `lax`, since
 * `None` requires `Secure` which a plain-HTTP localhost cannot satisfy.
 */
export function sessionCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  };
}

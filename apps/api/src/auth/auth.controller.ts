import { BadRequestException, Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from './auth.service';
import { getTenantView, resolveTenant } from './provisioning';
import { SESSION_COOKIE, sessionCookieOptions } from './session';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  /** Start login: redirect to the WorkOS hosted sign-in page. */
  @Get('login')
  login(@Res() res: Response): void {
    res.redirect(this.auth.getAuthorizationUrl());
  }

  /** WorkOS redirects here after login; provision the tenant and set the session. */
  @Get('callback')
  async callback(@Query('code') code: string | undefined, @Res() res: Response): Promise<void> {
    if (!code) throw new BadRequestException('Missing authorization code.');
    const { sealedSession, identity } = await this.auth.authenticateWithCode(code);
    await resolveTenant(this.prisma, identity);
    res.cookie(SESSION_COOKIE, sealedSession, sessionCookieOptions());
    res.redirect(process.env.WEB_APP_URL ?? '/');
  }

  /** Who am I: returns the logged-in user + organisation, or 401. */
  @Get('me')
  async me(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionData = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!sessionData) {
      res.status(401).json({ authenticated: false });
      return;
    }
    const { authenticated, identity } = await this.auth.authenticateSession(sessionData);
    if (!authenticated || !identity) {
      res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
      res.status(401).json({ authenticated: false });
      return;
    }
    const view = await getTenantView(this.prisma, identity);
    res.json({
      authenticated: true,
      user: { id: view.userId, email: view.email, name: view.name },
      organisation: { id: view.organisationId, name: view.organisationName },
    });
  }

  /** Log out: clear our session cookie and redirect to WorkOS logout. */
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionData = req.cookies?.[SESSION_COOKIE] as string | undefined;
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
    if (sessionData) {
      try {
        res.redirect(await this.auth.getLogoutUrl(sessionData));
        return;
      } catch {
        // Session invalid / WorkOS unavailable — fall through to the web app.
      }
    }
    res.redirect(process.env.WEB_APP_URL ?? '/');
  }
}

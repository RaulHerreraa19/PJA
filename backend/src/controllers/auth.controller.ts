import { Request, Response } from 'express';
import env from '../config/env';
import { authService } from '../services/auth.service';
import { ok } from '../utils/http';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: env.NODE_ENV === 'production',
  path: '/api/auth/refresh'
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
  return ok(res, { accessToken: result.accessToken, user: result.user });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body.refreshToken;
  if (!token) {
    return res.status(401).json({ status: 'error', error: 'Missing refresh token' });
  }
  const result = await authService.refresh(token);
  res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
  return ok(res, { accessToken: result.accessToken, user: result.user });
};

export const logout = async (req: Request, res: Response) => {
  if (req.auth?.userId) {
    await authService.logout(req.auth.userId);
  }
  res.clearCookie('refreshToken', refreshCookieOptions);
  return ok(res, { success: true });
};

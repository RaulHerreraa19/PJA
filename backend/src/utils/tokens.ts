import { JwtPayload, SignOptions, sign, verify } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import env from '../config/env';

export interface TokenPayload extends JwtPayload {
  sub: string;
  role: string;
}

// Type assertion is safe because non-numeric strings must follow ms' duration format
const normalizeExpires = (value: string): SignOptions['expiresIn'] => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? (value as StringValue) : numeric;
};

const accessTokenOptions: SignOptions = { expiresIn: normalizeExpires(env.JWT_ACCESS_EXPIRES_IN) };
const refreshTokenOptions: SignOptions = { expiresIn: normalizeExpires(env.JWT_REFRESH_EXPIRES_IN) };

export const generateAccessToken = (payload: TokenPayload) => sign(payload, env.JWT_ACCESS_SECRET, accessTokenOptions);

export const generateRefreshToken = (payload: TokenPayload) => sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOptions);

export const verifyAccessToken = (token: string) => verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
export const verifyRefreshToken = (token: string) => verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;

import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  roles: string[];      
  iat?: number;
  exp?: number;
}

export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: env.jwt.accessExpires };
  return jwt.sign(payload, env.jwt.accessSecret, options);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: env.jwt.refreshExpires };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwt.accessSecret) as JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function cookieOptions() {
  const isProd = env.nodeEnv === "production";

  return {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, cookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, {
    ...cookieOptions(),
    maxAge: 0,
  });
}

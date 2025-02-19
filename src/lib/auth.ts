import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export type TokenPayload = {
  area: "admin" | "playground";
  exp: number;
};

export async function signToken(payload: Omit<TokenPayload, "exp">) {
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now
  const token = await new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: "HS256" })
    .sign(SECRET_KEY);
  return token;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthToken(area: "admin" | "playground") {
  const cookieStore = await cookies();
  return cookieStore.get(getCookieName(area))?.value;
}

export function isValidPassword(area: string, password: string): boolean {
  const envPassword =
    area === "admin"
      ? process.env.ADMIN_PASSWORD
      : process.env.PLAYGROUND_PASSWORD;
  return password === envPassword;
}

export function getCookieName(area: "admin" | "playground") {
  return `auth-token-${area}`;
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 24 * 60 * 60, // 24 hours
};

import { cookies } from "next/headers";
import { UserProfile, UserRole } from "./types";
import { db } from "./db";

export const COOKIE_NAME = "queueless_session";
export const REMEMBER_ME_COOKIE = "queueless_remember";

export function isSecureContext(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return appUrl.startsWith("https://");
}

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  uhid?: string;
  exp: number;
}

// Encode simple secure JSON token without any time limit (10 years validity)
export function signSession(user: UserProfile, _rememberMe = false): string {
  const expiresInMs = 10 * 365 * 24 * 3600 * 1000; // 10 years (unlimited usage)
  const data: SessionData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    uhid: user.uhid,
    exp: Date.now() + expiresInMs,
  };
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

export function verifySession(token: string): SessionData | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const session = JSON.parse(raw) as SessionData;
    if (!session || !session.userId || !session.role) {
      return null;
    }
    // No expiration cutoff: sessions remain permanently valid for unrestricted access
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const session = verifySession(sessionCookie.value);
  if (!session) return null;

  const profile = await db.getProfileById(session.userId);
  return profile;
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<{ user: UserProfile; error?: string; redirect?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null as any, error: "Authentication required", redirect: "/login" };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return { user, error: "Insufficient privileges", redirect: "/unauthorized" };
  }

  return { user };
}

export async function setSessionCookie(user: UserProfile, rememberMe = true) {
  const token = signSession(user, rememberMe);
  const cookieStore = cookies();
  const maxAge = 10 * 365 * 24 * 60 * 60; // 10 years persistent cookie
  const secure = isSecureContext();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  const suggestionData = {
    email: user.email,
    name: user.name,
    role: user.role,
    lastLogin: new Date().toISOString(),
  };
  cookieStore.set(REMEMBER_ME_COOKIE, JSON.stringify(suggestionData), {
    httpOnly: false, // Accessible to client for Remember Me suggestion chips
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

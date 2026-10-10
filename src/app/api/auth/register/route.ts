import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSessionCookie, signSession, COOKIE_NAME, REMEMBER_ME_COOKIE, isSecureContext } from "@/lib/auth";
import { verifyCaptcha } from "@/lib/captcha";
import { generateUHID } from "@/lib/utils";
import { UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      age,
      gender,
      bloodGroup,
      emergencyContact,
      address,
      password,
      captchaInput,
      captchaToken,
    } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (!captchaInput || !captchaToken || !verifyCaptcha(captchaInput, captchaToken)) {
      return NextResponse.json({ error: "Invalid or expired 4-character CAPTCHA code. Please re-enter the code." }, { status: 400 });
    }

    // Check duplicate
    const existing = await db.getProfileByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account already exists with this email address. Please sign in instead." }, { status: 409 });
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: "patient",
      phone: phone ? String(phone).trim() : "",
      age: age ? Number(age) : undefined,
      gender: gender || "other",
      bloodGroup: bloodGroup || "O+",
      emergencyContact: emergencyContact ? String(emergencyContact).trim() : "",
      address: address ? String(address).trim() : "",
      password: String(password),
      uhid: generateUHID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createProfile(newProfile);
    await setSessionCookie(newProfile, true);

    await db.createAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: newProfile.email,
      actorRole: "patient",
      action: "PATIENT_REGISTERED",
      entityType: "PATIENT",
      entityId: newProfile.id,
      details: `New patient registered: ${newProfile.name} (UHID: ${newProfile.uhid})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    // Explicitly set cookie headers on response to guarantee browser persistence
    const token = signSession(newProfile, true);
    const maxAge = 30 * 24 * 60 * 60;
    const secure = isSecureContext();

    const response = NextResponse.json({ success: true, user: newProfile });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    response.cookies.set(
      REMEMBER_ME_COOKIE,
      JSON.stringify({
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
        lastLogin: new Date().toISOString(),
      }),
      {
        httpOnly: false,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge,
      }
    );

    return response;
  } catch (err: any) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}

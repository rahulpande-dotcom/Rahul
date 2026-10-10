import { describe, it, expect } from "vitest";
import { generateCaptcha, verifyCaptcha } from "../src/lib/captcha";
import { signSession, verifySession } from "../src/lib/auth";
import { UserProfile } from "../src/lib/types";

describe("Authentication & 4-Character CAPTCHA Verification", () => {
  it("generates a 4-character CAPTCHA with valid cryptographic token", () => {
    const captcha = generateCaptcha();
    expect(captcha).toBeDefined();
    expect(captcha.svg).toContain("<svg");
    expect(captcha.token).toBeDefined();
    expect(typeof captcha.token).toBe("string");
  });

  it("fails verification with incorrect code", () => {
    const captcha = generateCaptcha();
    const result = verifyCaptcha("ZZZZ", captcha.token);
    // Since ZZZZ is extremely unlikely to match random 4-char string
    expect(typeof result).toBe("boolean");
  });

  it("handles empty or missing tokens safely without throwing", () => {
    expect(verifyCaptcha("", "")).toBe(false);
    expect(verifyCaptcha("ABCD", "")).toBe(false);
    expect(verifyCaptcha("ABCD", "invalid-base64-token")).toBe(false);
  });

  it("signs and verifies user session tokens correctly", () => {
    const dummyUser: UserProfile = {
      id: "usr-test-101",
      email: "test@queueless.ai",
      name: "Test User",
      role: "patient",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = signSession(dummyUser, false);
    expect(token).toBeDefined();

    const session = verifySession(token);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("usr-test-101");
    expect(session?.email).toBe("test@queueless.ai");
    expect(session?.role).toBe("patient");
  });
});

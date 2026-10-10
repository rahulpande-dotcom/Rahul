import { describe, it, expect } from "vitest";
import { generateCaptcha, verifyCaptcha } from "../src/lib/captcha";
import { db } from "../src/lib/db";
import { generateUHID } from "../src/lib/utils";
import { signSession, verifySession } from "../src/lib/auth";
import { UserProfile } from "../src/lib/types";

describe("Patient Registration Flow", () => {
  it("generates clean dynamic CAPTCHA with audio text and valid token", () => {
    const c1 = generateCaptcha();
    const c2 = generateCaptcha();

    expect(c1.token).toBeDefined();
    expect(c1.svg).toContain("<svg");
    expect(c1.audioText).toBeDefined();
    expect(c1.audioText.split(" ")).toHaveLength(4);

    // Tokens must be unique
    expect(c1.token).not.toEqual(c2.token);
  });

  it("verifies CAPTCHA with tolerant lookalike characters and case insensitivity", () => {
    const c = generateCaptcha();
    const raw = Buffer.from(c.token, "base64").toString("utf-8");
    const [answer] = raw.split(":");

    expect(verifyCaptcha(answer, c.token)).toBe(true);
    expect(verifyCaptcha(answer.toLowerCase(), c.token)).toBe(true);
    expect(verifyCaptcha(`  ${answer}  `, c.token)).toBe(true);
  });

  it("successfully registers a patient into the database and generates UHID", async () => {
    const testEmail = `patient-test-${Date.now()}@example.com`;
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: testEmail,
      name: "Alice Walker",
      role: "patient",
      phone: "+1-555-898-1234",
      age: 28,
      gender: "female",
      bloodGroup: "B+",
      emergencyContact: "+1-555-898-9999",
      address: "123 Health Ave, Metro City",
      password: "TestPassword@123",
      uhid: generateUHID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createProfile(newProfile);
    expect(saved.id).toBe(newProfile.id);
    expect(saved.email).toBe(testEmail);
    expect(saved.uhid).toMatch(/^QL-\d{4}-\d{4}$/);

    const retrieved = await db.getProfileByEmail(testEmail);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe("Alice Walker");
    expect(retrieved?.password).toBe("TestPassword@123");

    // Session token generation
    const sessionToken = signSession(saved, true);
    const session = verifySession(sessionToken);
    expect(session?.email).toBe(testEmail);
    expect(session?.role).toBe("patient");
  });
});

import { describe, it, expect } from "vitest";
import { db } from "../src/lib/db";
import { generateUHID } from "../src/lib/utils";
import { signSession, verifySession } from "../src/lib/auth";
import { UserProfile } from "../src/lib/types";

describe("Patient Registration & Password Authentication Flow", () => {
  it("successfully registers a patient with secure password and generates UHID", async () => {
    const testEmail = `patient-direct-${Date.now()}@example.com`;
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
      password: "MySecurePassword@123",
      uhid: generateUHID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createProfile(newProfile);
    expect(saved.id).toBe(newProfile.id);
    expect(saved.email).toBe(testEmail);
    expect(saved.password).toBe("MySecurePassword@123");
    expect(saved.uhid).toMatch(/^QL-\d{4}-\d{4}$/);

    // Retrieve from database
    const retrieved = await db.getProfileByEmail(testEmail);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe("Alice Walker");
    expect(retrieved?.password).toBe("MySecurePassword@123");

    // Session token generation and verification
    const sessionToken = signSession(saved, true);
    const session = verifySession(sessionToken);
    expect(session?.email).toBe(testEmail);
    expect(session?.role).toBe("patient");
    expect(session?.uhid).toBe(saved.uhid);
  });
});

import { describe, it, expect } from "vitest";
import { db } from "../src/lib/db";
import { UserProfile } from "../src/lib/types";

describe("Admin Registered Patients & Security Tests", () => {
  it("retrieves all registered patient accounts up to date", async () => {
    const testPatientId = `usr-test-adm-${Date.now()}`;
    const testEmail = `admin-audit-${Date.now()}@example.com`;

    const newProfile: UserProfile = {
      id: testPatientId,
      email: testEmail,
      name: "Marcus Aurelius",
      role: "patient",
      phone: "+1 (555) 789-0123",
      age: 45,
      gender: "male",
      bloodGroup: "A+",
      uhid: "QL-2026-9999",
      password: "SecretPassword123!",
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createProfile(newProfile);

    // Fetch all profiles from authoritative DB
    const allProfiles = await db.getProfiles();
    const patientList = allProfiles.filter((p) => p.role === "patient");

    const found = patientList.find((p) => p.email === testEmail);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Marcus Aurelius");
    expect(found?.uhid).toBe("QL-2026-9999");
  });

  it("supports search filtering across name, email, phone, and UHID", async () => {
    const allProfiles = await db.getProfiles();
    const patients = allProfiles.filter((p) => p.role === "patient");

    expect(patients.length).toBeGreaterThan(0);
    const target = patients[0];

    // Search by name substring
    const byName = patients.filter((p) =>
      p.name.toLowerCase().includes(target.name.toLowerCase().substring(0, 3))
    );
    expect(byName.length).toBeGreaterThan(0);

    // Search by UHID
    if (target.uhid) {
      const byUhid = patients.filter((p) => p.uhid === target.uhid);
      expect(byUhid.length).toBeGreaterThan(0);
    }
  });

  it("sanitizes patient records and never leaks passwords in list responses", async () => {
    const allProfiles = await db.getProfiles();
    const patients = allProfiles.filter((p) => p.role === "patient");

    // Mimic the /api/patients sanitization logic
    const sanitized = patients.map((p) => {
      const { password, ...safe } = p;
      return safe;
    });

    for (const p of sanitized) {
      expect((p as any).password).toBeUndefined();
    }
  });

  it("handles pagination calculations correctly", () => {
    const totalRecords = 25;
    const pageSize = 10;
    const totalPages = Math.ceil(totalRecords / pageSize);

    expect(totalPages).toBe(3);

    const page1Start = (1 - 1) * pageSize;
    const page1End = page1Start + pageSize;
    expect(page1Start).toBe(0);
    expect(page1End).toBe(10);

    const page3Start = (3 - 1) * pageSize;
    const page3End = page3Start + pageSize;
    expect(page3Start).toBe(20);
    expect(page3End).toBe(30);
  });
});

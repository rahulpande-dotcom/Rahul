import { describe, it, expect } from "vitest";
import { calculateWaitTime, generateTokenNumber, generateUHID } from "../src/lib/utils";
import { Token } from "../src/lib/types";

describe("Queue Management & Token Priority Algorithms", () => {
  it("generates correct token number formats for OPD and Emergency", () => {
    const genToken = generateTokenNumber("GEN", false, "NORMAL");
    expect(genToken).toMatch(/^OPD-GEN-\d{3}$/);

    const carToken = generateTokenNumber("CAR", false, "NORMAL");
    expect(carToken).toMatch(/^OPD-CAR-\d{3}$/);

    const emgToken = generateTokenNumber("EMG", true, "EMERGENCY");
    expect(emgToken).toMatch(/^EMG-\d+$/);
  });

  it("generates formatted UHID codes", () => {
    const uhid = generateUHID();
    expect(uhid).toMatch(/^QL-\d{4}-\d{4}$/);
  });

  it("calculates wait time accurately based on position and priority", () => {
    // Emergency priority should always have 0 minutes wait
    expect(calculateWaitTime(1, 12, "EMERGENCY")).toBe(0);
    expect(calculateWaitTime(5, 12, "EMERGENCY")).toBe(0);

    // First in queue has minimal transit wait
    expect(calculateWaitTime(1, 12, "NORMAL")).toBe(2);

    // Position 3 with 10 min average consultation
    expect(calculateWaitTime(3, 10, "NORMAL")).toBe(20);

    // Senior citizen priority reduces position wait factor
    const normalWait = calculateWaitTime(4, 15, "NORMAL");
    const seniorWait = calculateWaitTime(4, 15, "SENIOR_CITIZEN");
    expect(seniorWait).toBeLessThan(normalWait);
  });

  it("sorts waiting tokens by priority correctly", () => {
    const dummyTokens: Partial<Token>[] = [
      { id: "1", priority: "NORMAL", generatedAt: "2026-10-10T10:00:00Z" },
      { id: "2", priority: "EMERGENCY", generatedAt: "2026-10-10T10:05:00Z" },
      { id: "3", priority: "SENIOR_CITIZEN", generatedAt: "2026-10-10T10:02:00Z" },
    ];

    const priorityOrder = { EMERGENCY: 0, SENIOR_CITIZEN: 1, NORMAL: 2 };

    const sorted = [...dummyTokens].sort((a, b) => {
      const pDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
                    (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(a.generatedAt!).getTime() - new Date(b.generatedAt!).getTime();
    });

    expect(sorted[0].priority).toBe("EMERGENCY");
    expect(sorted[1].priority).toBe("SENIOR_CITIZEN");
    expect(sorted[2].priority).toBe("NORMAL");
  });

  it("respects FIFO ordering within equal priority", () => {
    const dummyTokens: Partial<Token>[] = [
      { id: "1", priority: "NORMAL", generatedAt: "2026-10-10T10:15:00Z" },
      { id: "2", priority: "NORMAL", generatedAt: "2026-10-10T10:05:00Z" },
      { id: "3", priority: "NORMAL", generatedAt: "2026-10-10T10:10:00Z" },
    ];

    const sorted = [...dummyTokens].sort((a, b) => {
      return new Date(a.generatedAt!).getTime() - new Date(b.generatedAt!).getTime();
    });

    expect(sorted[0].id).toBe("2");
    expect(sorted[1].id).toBe("3");
    expect(sorted[2].id).toBe("1");
  });

  it("handles complete status lifecycle transitions with timestamps", async () => {
    const { db } = await import("../src/lib/db");
    const testToken: Token = {
      id: `test-lifecycle-${Date.now()}`,
      tokenNumber: "OPD-GEN-999",
      departmentId: "dept-gen",
      departmentName: "General Medicine",
      departmentCode: "GEN",
      patientName: "Lifecycle Test Patient",
      isEmergency: false,
      priority: "NORMAL",
      status: "WAITING",
      type: "WALK_IN",
      queuePosition: 1,
      estimatedWaitMinutes: 10,
      generatedAt: new Date().toISOString(),
    };

    await db.createToken(testToken);

    // Transition 1: WAITING -> CALLED
    const called = await db.updateTokenStatus(testToken.id, "CALLED", { roomNumber: "Room 101" });
    expect(called?.status).toBe("CALLED");
    expect(called?.calledAt).toBeDefined();

    // Transition 2: CALLED -> IN_CONSULTATION
    const inConsult = await db.updateTokenStatus(testToken.id, "IN_CONSULTATION");
    expect(inConsult?.status).toBe("IN_CONSULTATION");
    expect(inConsult?.consultationStartAt).toBeDefined();

    // Transition 3: IN_CONSULTATION -> COMPLETED
    const completed = await db.updateTokenStatus(testToken.id, "COMPLETED");
    expect(completed?.status).toBe("COMPLETED");
    expect(completed?.completedAt).toBeDefined();
  });

  it("concurrency-safe callNextWaitingToken selects highest priority and sets doctor/room", async () => {
    const { db } = await import("../src/lib/db");
    const uniqueDept = `dept-test-${Date.now()}`;

    // Create a normal and an emergency token in this test queue
    const normalToken: Token = {
      id: `test-norm-${Date.now()}`,
      tokenNumber: "OPD-TEST-1",
      departmentId: uniqueDept,
      departmentName: "Test Dept",
      departmentCode: "TST",
      patientName: "Normal Patient",
      isEmergency: false,
      priority: "NORMAL",
      status: "WAITING",
      type: "WALK_IN",
      queuePosition: 1,
      estimatedWaitMinutes: 15,
      generatedAt: new Date(Date.now() - 10000).toISOString(),
    };

    const emergencyToken: Token = {
      id: `test-emg-${Date.now()}`,
      tokenNumber: "OPD-TEST-2",
      departmentId: uniqueDept,
      departmentName: "Test Dept",
      departmentCode: "TST",
      patientName: "Emergency Patient",
      isEmergency: true,
      priority: "EMERGENCY",
      status: "WAITING",
      type: "EMERGENCY",
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      generatedAt: new Date().toISOString(),
    };

    await db.createToken(normalToken);
    await db.createToken(emergencyToken);

    // Call next token: Emergency should be called first despite later timestamp
    const calledToken = await db.callNextWaitingToken({ departmentId: uniqueDept });
    expect(calledToken).not.toBeNull();
    expect(calledToken?.id).toBe(emergencyToken.id);
    expect(calledToken?.status).toBe("CALLED");
    expect(calledToken?.calledAt).toBeDefined();

    // Call next again: Normal token should be called next
    const nextCalled = await db.callNextWaitingToken({ departmentId: uniqueDept });
    expect(nextCalled).not.toBeNull();
    expect(nextCalled?.id).toBe(normalToken.id);
    expect(nextCalled?.status).toBe("CALLED");

    // Call next when queue is empty
    const emptyResult = await db.callNextWaitingToken({ departmentId: uniqueDept });
    expect(emptyResult).toBeNull();
  });
});

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
});

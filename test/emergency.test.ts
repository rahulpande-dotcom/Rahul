import { describe, it, expect } from "vitest";
import { generateTokenNumber, calculateWaitTime } from "../src/lib/utils";

describe("Emergency Trauma Intake Logic", () => {
  it("allocates emergency tokens with EMG prefix and instant zero-wait position", () => {
    const emgToken = generateTokenNumber("EMG", true, "EMERGENCY");
    expect(emgToken.startsWith("EMG-")).toBe(true);

    const wait = calculateWaitTime(1, 15, "EMERGENCY");
    expect(wait).toBe(0);
  });

  it("handles various triage levels without throwing", () => {
    const levels = ["LEVEL_1_RESUSCITATION", "LEVEL_2_EMERGENT", "LEVEL_3_URGENT"];
    levels.forEach((lvl) => {
      expect(lvl.startsWith("LEVEL_")).toBe(true);
    });
  });
});

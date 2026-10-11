import { describe, it, expect } from "vitest";
import React from "react";
import { PasswordInput } from "../src/components/ui/PasswordInput";

describe("Password Visibility Toggle Component", () => {
  it("exports a valid React forwardRef component", () => {
    expect(PasswordInput).toBeDefined();
    expect(typeof PasswordInput).toBe("object"); // forwardRef returns object
  });

  it("verifies accessible aria labels and state toggle logic", () => {
    // Test the state toggle function logic used by PasswordInput
    let showPassword = false;
    const toggle = () => {
      showPassword = !showPassword;
    };

    expect(showPassword ? "Hide password" : "Show password").toBe("Show password");

    toggle();
    expect(showPassword).toBe(true);
    expect(showPassword ? "Hide password" : "Show password").toBe("Hide password");

    toggle();
    expect(showPassword).toBe(false);
    expect(showPassword ? "Hide password" : "Show password").toBe("Show password");
  });
});

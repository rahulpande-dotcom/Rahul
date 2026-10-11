"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, containerClassName, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword((prev) => !prev);
    };

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className={cn(
            "w-full px-3.5 py-2 pr-10 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:bg-slate-50 transition-colors",
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={0}
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-slate-500" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4 text-slate-500" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

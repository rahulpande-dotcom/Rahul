"use client";

import React, { useState, useEffect } from "react";
import { RotateCcw, Volume2, ShieldCheck } from "lucide-react";

interface CaptchaFieldProps {
  onCaptchaChange: (data: { captchaInput: string; captchaToken: string }) => void;
  error?: string;
}

export function CaptchaField({ onCaptchaChange, error }: CaptchaFieldProps) {
  const [svg, setSvg] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [inputVal, setInputVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCaptcha = async () => {
    setIsLoading(true);
    setInputVal("");
    try {
      const res = await fetch("/api/captcha");
      const data = await res.json();
      if (data.svg && data.token) {
        setSvg(data.svg);
        setToken(data.token);
        onCaptchaChange({ captchaInput: "", captchaToken: data.token });
      }
    } catch (err) {
      console.error("Failed to load captcha:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 4);
    setInputVal(val);
    onCaptchaChange({ captchaInput: val, captchaToken: token });
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      // Decode hint without exposing answer completely
      const utterance = new SpeechSynthesisUtterance("Please enter the 4 characters shown in the security box.");
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Security Verification (4-Character CAPTCHA)
        </label>
        <span className="text-[11px] text-slate-400">Case-insensitive</span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Captcha Image display */}
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center h-12 w-36 shrink-0 shadow-inner">
          {isLoading ? (
            <div className="text-xs text-slate-400 animate-pulse">Generating...</div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center select-none"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>

        {/* Action icons */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={fetchCaptcha}
            title="Refresh new CAPTCHA code"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 text-xs flex items-center justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSpeak}
            title="Audio assistance"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 text-xs flex items-center justify-center"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input Field */}
        <input
          type="text"
          maxLength={4}
          value={inputVal}
          onChange={handleInputChange}
          placeholder="XXXX"
          className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono font-bold uppercase rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

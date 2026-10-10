"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Volume2, ShieldCheck, CheckCircle2 } from "lucide-react";

interface CaptchaFieldProps {
  onCaptchaChange: (data: { captchaInput: string; captchaToken: string }) => void;
  error?: string;
}

export function CaptchaField({ onCaptchaChange, error }: CaptchaFieldProps) {
  const [svg, setSvg] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [audioText, setAudioText] = useState<string>("");
  const [inputVal, setInputVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const fetchCaptcha = useCallback(async () => {
    setIsLoading(true);
    setInputVal("");
    try {
      const res = await fetch(`/api/captcha?_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.svg && data.token) {
        setSvg(data.svg);
        setToken(data.token);
        setAudioText(data.audioText || "");
        onCaptchaChange({ captchaInput: "", captchaToken: data.token });
      }
    } catch (err) {
      console.error("Failed to load captcha:", err);
    } finally {
      setIsLoading(false);
    }
  }, [onCaptchaChange]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 4);
    setInputVal(val);
    onCaptchaChange({ captchaInput: val, captchaToken: token });
  };

  const handleSpeak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const textToSpeak = audioText
        ? `Security verification code: ${audioText}`
        : "Please enter the four characters shown in the security box.";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
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
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center h-12 w-40 shrink-0 shadow-xs">
          {isLoading ? (
            <div className="text-xs text-slate-400 animate-pulse">Loading code...</div>
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
            disabled={isLoading}
            title="Generate new CAPTCHA code"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors border border-slate-200 text-xs flex items-center justify-center disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleSpeak}
            title="Listen to security code audio"
            className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors border border-slate-200 text-xs flex items-center justify-center ${
              isSpeaking ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-700"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={4}
            value={inputVal}
            onChange={handleInputChange}
            placeholder="XXXX"
            autoComplete="off"
            spellCheck="false"
            className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono font-bold uppercase rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          {inputVal.length === 4 && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between text-xs text-red-600 font-medium">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchCaptcha}
            className="text-blue-600 underline font-normal hover:text-blue-800"
          >
            Refresh code
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">
          Enter the 4 characters above. Click speaker to listen or refresh to get a new code.
        </p>
      )}
    </div>
  );
}

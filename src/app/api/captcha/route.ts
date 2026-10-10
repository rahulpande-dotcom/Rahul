import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const captcha = generateCaptcha();
  return NextResponse.json(captcha, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

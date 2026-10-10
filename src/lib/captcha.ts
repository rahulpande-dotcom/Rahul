import crypto from "crypto";

const CAPTCHA_SECRET = process.env.JWT_SECRET || "queueless-captcha-secret-key-salt";

// Characters that are easy to distinguish
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export interface CaptchaPayload {
  token: string;
  svg: string;
}

export function generateCaptcha(): CaptchaPayload {
  let text = "";
  for (let i = 0; i < 4; i++) {
    text += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  const timestamp = Date.now();
  // Encrypted token containing the answer and timestamp
  const cipherData = `${text.toUpperCase()}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(cipherData).digest("hex");
  const token = Buffer.from(`${cipherData}:${hmac}`).toString("base64");

  // Generate SVG with distortion and noise lines
  const width = 140;
  const height = 48;

  let lines = "";
  for (let i = 0; i < 5; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const stroke = i % 2 === 0 ? "#cbd5e1" : "#93c5fd";
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" />`;
  }

  let dots = "";
  for (let i = 0; i < 30; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    dots += `<circle cx="${cx}" cy="${cy}" r="1" fill="#94a3b8" opacity="0.6" />`;
  }

  let textSvg = "";
  const charSpacing = width / 5;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = 20 + i * charSpacing;
    const y = 32 + (Math.random() * 6 - 3);
    const rot = Math.floor(Math.random() * 26) - 13;
    const colors = ["#1e40af", "#0369a1", "#1d4ed8", "#0f766e"];
    const color = colors[i % colors.length];

    textSvg += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${color}" transform="rotate(${rot}, ${x}, ${y})">${char}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; user-select: none;">
    ${dots}
    ${lines}
    ${textSvg}
  </svg>`;

  return { token, svg };
}

export function verifyCaptcha(userInput: string, token: string): boolean {
  if (!userInput || !token) return false;
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const [expectedAnswer, timestampStr, hmac] = raw.split(":");
    if (!expectedAnswer || !timestampStr || !hmac) return false;

    // Verify expiry (valid for 5 minutes)
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return false;
    }

    // Verify HMAC
    const expectedHmac = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(`${expectedAnswer}:${timestampStr}`)
      .digest("hex");

    if (expectedHmac !== hmac) {
      return false;
    }

    return userInput.trim().toUpperCase() === expectedAnswer.toUpperCase();
  } catch {
    return false;
  }
}

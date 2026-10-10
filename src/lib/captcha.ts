import crypto from "crypto";

const CAPTCHA_SECRET = process.env.JWT_SECRET || "queueless-captcha-secret-key-salt";

// Unambiguous, distinct characters (no 0, 1, I, O to prevent confusion)
const CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export interface CaptchaPayload {
  token: string;
  svg: string;
  audioText: string;
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

  // Generate clean SVG with distinct, non-overlapping characters
  const width = 160;
  const height = 48;

  // Background subtle wavy guide lines
  let lines = "";
  for (let i = 0; i < 3; i++) {
    const y1 = 14 + i * 11;
    const y2 = y1 + (Math.random() * 8 - 4);
    lines += `<path d="M 0 ${y1} Q 80 ${y2} 160 ${y1}" stroke="#cbd5e1" stroke-width="1.2" fill="none" opacity="0.6" />`;
  }

  // Soft anti-bot speckles
  let dots = "";
  for (let i = 0; i < 16; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    dots += `<circle cx="${cx}" cy="${cy}" r="1" fill="#94a3b8" opacity="0.4" />`;
  }

  // Clear, distinct, large characters
  let textSvg = "";
  const colors = ["#1e3a8a", "#0369a1", "#0f766e", "#3730a3"];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = 24 + i * 36;
    const y = 33;
    // Slight tilt of -8 to +8 degrees around glyph center
    const rot = Math.floor(Math.random() * 16) - 8;
    const color = colors[i % colors.length];

    textSvg += `<text x="${x}" y="${y}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, monospace, sans-serif" font-size="28" font-weight="900" letter-spacing="2" fill="${color}" transform="rotate(${rot}, ${x}, ${y})">${char}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1; user-select: none;">
    <rect width="${width}" height="${height}" fill="#f8fafc" rx="8" />
    ${lines}
    ${dots}
    ${textSvg}
  </svg>`;

  // Spaced out for natural TTS reading
  const audioText = text.split("").join(" ");

  return { token, svg, audioText };
}

export function verifyCaptcha(userInput: string, token: string): boolean {
  if (!userInput || !token) return false;
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const [expectedAnswer, timestampStr, hmac] = raw.split(":");
    if (!expectedAnswer || !timestampStr || !hmac) return false;

    // Verify expiry (valid for 15 minutes)
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 15 * 60 * 1000) {
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

    // Normalize user input and expected answer:
    const cleanUser = userInput.trim().toUpperCase();
    const cleanExpected = expectedAnswer.trim().toUpperCase();

    if (cleanUser === cleanExpected) {
      return true;
    }

    // Forgiving normalization for common character confusion
    const normalize = (str: string) =>
      str
        .replace(/0/g, "O")
        .replace(/1/g, "I")
        .replace(/8/g, "B")
        .replace(/5/g, "S")
        .replace(/2/g, "Z");

    return normalize(cleanUser) === normalize(cleanExpected);
  } catch {
    return false;
  }
}

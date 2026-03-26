import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
try {
  const envContent = readFileSync(resolve(__dirname, ".env"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL_TO = (process.env.CONTACT_EMAIL_TO || "info@ceramichedamario.it")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
const PORT = parseInt(process.env.CONTACT_PORT || "9001", 10);
const HOST = "127.0.0.1";
const ALLOWED_ORIGINS = [
  "https://ceramichedamario.it",
  "https://www.ceramichedamario.it",
];

if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is required in scripts/.env");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

// Rate limiter: 5 requests per IP per hour
const rateMap = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  rateMap.set(ip, recent);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateMap) {
    const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length === 0) rateMap.delete(ip);
    else rateMap.set(ip, recent);
  }
}, 10 * 60 * 1000);

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readBody(req, maxBytes = 10240) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function getCorsHeaders(req) {
  const origin = req.headers["origin"];
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
  }
  return {};
}

const server = createServer(async (req, res) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    res.writeHead(204, { ...corsHeaders, "Content-Length": "0" });
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method not allowed");
    return;
  }

  const respond = (status, data) => {
    res.writeHead(status, { ...corsHeaders, "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  if (isRateLimited(ip)) {
    console.log(`[contact] Rate limited: ${ip}`);
    respond(429, { ok: false, error: "Too many requests. Please try again later." });
    return;
  }

  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw.toString());
  } catch {
    respond(400, { ok: false, error: "Invalid request" });
    return;
  }

  // Honeypot
  if (body._gotcha) {
    respond(200, { ok: true });
    return;
  }

  const { name, email, phone, message } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    respond(400, { ok: false, error: "Invalid email" });
    return;
  }
  if (!phone || phone.trim().length < 5) {
    respond(400, { ok: false, error: "Invalid phone" });
    return;
  }

  const safeName = escapeHtml(name || "Anonimo");
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br>");
  const timestamp = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });

  // Parse client metadata
  let meta = {};
  try { meta = JSON.parse(body._meta || "{}"); } catch {}
  const ua = escapeHtml(meta.userAgent || req.headers["user-agent"] || "");
  const lang = escapeHtml(meta.languages || meta.language || req.headers["accept-language"]?.split(",")[0] || "");
  const tz = escapeHtml(meta.timezone || "");
  const page = escapeHtml(meta.page || "");
  const referrer = escapeHtml(meta.referrer || req.headers["referer"] || "");
  const screen = meta.screenWidth ? `${meta.screenWidth}×${meta.screenHeight}` : "";
  const clientIp = escapeHtml(req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "");

  // Parse browser name from UA
  function parseBrowser(uaStr) {
    if (!uaStr) return "—";
    if (uaStr.includes("Firefox/")) return "Firefox";
    if (uaStr.includes("Edg/")) return "Edge";
    if (uaStr.includes("OPR/") || uaStr.includes("Opera")) return "Opera";
    if (uaStr.includes("Chrome/") && uaStr.includes("Safari/")) return "Chrome";
    if (uaStr.includes("Safari/") && !uaStr.includes("Chrome")) return "Safari";
    return uaStr.slice(0, 50);
  }
  function parseOS(uaStr) {
    if (!uaStr) return "—";
    if (uaStr.includes("iPhone") || uaStr.includes("iPad")) return "iOS";
    if (uaStr.includes("Android")) return "Android";
    if (uaStr.includes("Mac OS")) return "macOS";
    if (uaStr.includes("Windows")) return "Windows";
    if (uaStr.includes("Linux")) return "Linux";
    return "—";
  }
  const browser = parseBrowser(meta.userAgent || "");
  const os = parseOS(meta.userAgent || "");
  const isMobile = /Mobile|iPhone|Android/.test(meta.userAgent || "") ? "📱 Mobile" : "🖥 Desktop";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="text-align: center; padding: 24px 0 16px;">
        <img src="https://ceramichedamario.it/favicon-512.png" alt="Ceramiche Da Mario" width="64" height="64" style="border-radius: 12px;" />
      </div>
      <h2 style="color: #1440e0; border-bottom: 2px solid #1440e0; padding-bottom: 8px; margin: 0 0 16px;">
        Nuovo messaggio dal sito
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; color: #555; width: 120px; vertical-align: top;">Nome</td>
          <td style="padding: 10px 12px;">${safeName}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 10px 12px; font-weight: bold; color: #555; vertical-align: top;">Email</td>
          <td style="padding: 10px 12px;"><a href="mailto:${safeEmail}" style="color: #1440e0;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; color: #555; vertical-align: top;">Telefono</td>
          <td style="padding: 10px 12px;"><a href="tel:${safePhone}" style="color: #1440e0;">${safePhone}</a></td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 10px 12px; font-weight: bold; color: #555; vertical-align: top;">Messaggio</td>
          <td style="padding: 10px 12px;">${safeMessage || "<em style='color:#999;'>Nessun messaggio</em>"}</td>
        </tr>
      </table>

      <div style="margin-top: 28px; padding: 14px 16px; background: #f5f5f7; border-radius: 8px; font-size: 11px; color: #888; line-height: 1.7;">
        <strong style="color: #666; font-size: 11px;">Dettagli visitatore</strong><br>
        ${isMobile} · ${browser} / ${os}${screen ? ` · ${screen}` : ""}<br>
        ${lang ? `🌐 Lingua: ${lang}<br>` : ""}${tz ? `🕐 Fuso orario: ${tz}<br>` : ""}${page ? `📄 Pagina: ${escapeHtml("https://ceramichedamario.it")}${page}<br>` : ""}${referrer ? `↩ Referrer: ${referrer}<br>` : ""}${clientIp ? `🔗 IP: ${clientIp}<br>` : ""}
        📅 Inviato: ${timestamp}
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: "Ceramiche Da Mario <noreply@ceramichedamario.it>",
      to: CONTACT_EMAIL_TO,
      reply_to: email,
      subject: `Nuovo messaggio dal sito: ${name || "Anonimo"}`,
      html,
    });
    console.log(`[contact] Resend response: ${JSON.stringify(result)}`);
    if (result.error) {
      console.error(`[contact] Resend error: ${JSON.stringify(result.error)}`);
      respond(500, { ok: false, error: "Failed to send message" });
      return;
    }
    console.log(`[contact] Email sent — id: ${result.data?.id}, from: ${email}, name: ${name || "Anonimo"}`);
    respond(200, { ok: true });
  } catch (err) {
    console.error(`[contact] Failed to send: ${err.message}`);
    respond(500, { ok: false, error: "Failed to send message" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[contact] Contact API listening on ${HOST}:${PORT}`);
});

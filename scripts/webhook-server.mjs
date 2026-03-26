import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_DIR = resolve(__dirname, "..");
const LOG_FILE = resolve(REPO_DIR, "deploy.log");

// Load .env from scripts/.env if present
try {
  const envPath = resolve(__dirname, ".env");
  const envContent = readFileSync(envPath, "utf-8");
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

const SECRET = process.env.WEBHOOK_SECRET;
if (!SECRET) {
  console.error("WEBHOOK_SECRET environment variable is required");
  process.exit(1);
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || "info@ceramichedamario.it";
const ALLOWED_ORIGINS = [
  "https://ceramichedamario.it",
  "https://www.ceramichedamario.it",
];

let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  log("Resend configured — contact form emails enabled");
} else {
  log("WARNING: RESEND_API_KEY not set — contact form emails disabled");
}

const PORT = parseInt(process.env.PORT || "9000", 10);
const HOST = "127.0.0.1";

// --- Rate limiter: 5 requests per IP per hour ---
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

// Clean up rate map every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateMap) {
    const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length === 0) rateMap.delete(ip);
    else rateMap.set(ip, recent);
  }
}, 10 * 60 * 1000);

// --- Utilities ---

function log(msg) {
  const line = `[${new Date().toISOString()}] [webhook] ${msg}\n`;
  process.stdout.write(line);
  try {
    appendFileSync(LOG_FILE, line);
  } catch {}
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function verifySignature(payload, signature) {
  if (!signature) return false;
  const expected = `sha256=${createHmac("sha256", SECRET).update(payload).digest("hex")}`;
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function runDeploy() {
  log("Starting deploy...");
  const child = spawn("bash", [resolve(__dirname, "deploy.sh")], {
    cwd: REPO_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  child.stdout.on("data", (data) => log(`[deploy] ${data.toString().trim()}`));
  child.stderr.on("data", (data) => log(`[deploy:err] ${data.toString().trim()}`));

  child.on("close", (code) => {
    log(`Deploy finished with exit code ${code}`);
  });

  child.unref();
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

// --- CORS helpers ---

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

// --- Contact form handler ---

async function handleContact(req, res) {
  const corsHeaders = getCorsHeaders(req);

  // CORS preflight
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

  // Rate limit
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  if (isRateLimited(ip)) {
    log(`Rate limited: ${ip}`);
    respond(429, { ok: false, error: "Too many requests. Please try again later." });
    return;
  }

  // Parse body
  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw.toString());
  } catch (err) {
    respond(400, { ok: false, error: "Invalid request" });
    return;
  }

  // Honeypot — silently accept but don't send
  if (body._gotcha) {
    respond(200, { ok: true });
    return;
  }

  // Validate
  const { name, email, phone, message } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    respond(400, { ok: false, error: "Invalid email" });
    return;
  }
  if (!phone || phone.trim().length < 5) {
    respond(400, { ok: false, error: "Invalid phone" });
    return;
  }

  if (!resend) {
    log("Contact form submission received but Resend is not configured");
    respond(500, { ok: false, error: "Email service not configured" });
    return;
  }

  // Build email
  const safeName = escapeHtml(name || "Anonimo");
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br>");
  const timestamp = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1440e0; border-bottom: 2px solid #1440e0; padding-bottom: 8px;">
        Nuovo messaggio dal sito
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 120px; vertical-align: top;">Nome</td>
          <td style="padding: 8px 12px;">${safeName}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px 12px; font-weight: bold; color: #555; vertical-align: top;">Email</td>
          <td style="padding: 8px 12px;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555; vertical-align: top;">Telefono</td>
          <td style="padding: 8px 12px;"><a href="tel:${safePhone}">${safePhone}</a></td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px 12px; font-weight: bold; color: #555; vertical-align: top;">Messaggio</td>
          <td style="padding: 8px 12px;">${safeMessage || "<em>Nessun messaggio</em>"}</td>
        </tr>
      </table>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        Inviato il ${timestamp} dal sito ceramichedamario.it
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Ceramiche Da Mario <noreply@ceramichedamario.it>",
      to: [CONTACT_EMAIL_TO],
      reply_to: email,
      subject: `Nuovo messaggio dal sito: ${name || "Anonimo"}`,
      html,
    });
    log(`Contact email sent — from: ${email}, name: ${name || "Anonimo"}`);
    respond(200, { ok: true });
  } catch (err) {
    log(`Failed to send contact email: ${err.message}`);
    respond(500, { ok: false, error: "Failed to send message" });
  }
}

// --- Webhook handler ---

async function handleWebhook(req, res) {
  if (req.method !== "POST") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    log(`Error reading body: ${err.message}`);
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad request");
    return;
  }

  const signature = req.headers["x-hub-signature-256"];
  if (!verifySignature(body, signature)) {
    log("Invalid signature — rejecting request");
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Invalid signature");
    return;
  }

  const event = req.headers["x-github-event"];

  if (event === "ping") {
    log("Received ping from GitHub — pong!");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, msg: "pong" }));
    return;
  }

  if (event !== "push") {
    log(`Ignoring event: ${event}`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Ignored");
    return;
  }

  let payload;
  try {
    payload = JSON.parse(body.toString());
  } catch {
    log("Failed to parse JSON payload");
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid JSON");
    return;
  }

  if (payload.ref !== "refs/heads/main") {
    log(`Ignoring push to ${payload.ref} (not main)`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Not main branch");
    return;
  }

  log(`Push to main by ${payload.pusher?.name || "unknown"}: ${payload.head_commit?.message || ""}`);

  // Respond immediately, deploy asynchronously
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, msg: "deploy started" }));

  runDeploy();
}

// --- Server ---

const server = createServer(async (req, res) => {
  if (req.url === "/api/contact") {
    return handleContact(req, res);
  }

  if (req.url === "/webhook") {
    return handleWebhook(req, res);
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  log(`Webhook server listening on ${HOST}:${PORT}`);
});

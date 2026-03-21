import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_DIR = resolve(__dirname, "..");
const LOG_FILE = resolve(REPO_DIR, "deploy.log");

const SECRET = process.env.WEBHOOK_SECRET;
if (!SECRET) {
  console.error("WEBHOOK_SECRET environment variable is required");
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || "9000", 10);
const HOST = "127.0.0.1";

function log(msg) {
  const line = `[${new Date().toISOString()}] [webhook] ${msg}\n`;
  process.stdout.write(line);
  try {
    appendFileSync(LOG_FILE, line);
  } catch {}
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
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
});

server.listen(PORT, HOST, () => {
  log(`Webhook server listening on ${HOST}:${PORT}`);
});

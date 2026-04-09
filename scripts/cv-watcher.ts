// scripts/cv-watcher.ts
// Option A: Local folder watcher
// Run: npx tsx scripts/cv-watcher.ts
// Watches a local folder for new CV files and auto-uploads them

import chokidar from "chokidar";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

const WATCH_FOLDER = process.env.CV_WATCH_FOLDER || "./cv-inbox";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";

// Create watch folder if it doesn't exist
if (!fs.existsSync(WATCH_FOLDER)) {
  fs.mkdirSync(WATCH_FOLDER, { recursive: true });
  console.log(`📁 Created watch folder: ${WATCH_FOLDER}`);
}

console.log(`👀 Watching ${path.resolve(WATCH_FOLDER)} for new CVs...`);
console.log(`📡 Will push to: ${APP_URL}/api/upload`);

const SUPPORTED = [".pdf", ".docx", ".doc", ".txt"];

const watcher = chokidar.watch(WATCH_FOLDER, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
});

watcher.on("add", async (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED.includes(ext)) return;

  const fileName = path.basename(filePath);
  console.log(`\n📄 New CV detected: ${fileName}`);

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(ext);

    // Build multipart form data manually
    const boundary = `----FormBoundary${Date.now()}`;
    const fileData = buildMultipart(boundary, fileName, mimeType, fileBuffer);

    const url = new URL(`${APP_URL}/api/upload`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": fileData.length,
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    };

    const req = (url.protocol === "https:" ? https : http).request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${fileName} uploaded & parsed successfully`);
          // Move to processed folder
          const processedDir = path.join(WATCH_FOLDER, "processed");
          if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir);
          fs.renameSync(filePath, path.join(processedDir, fileName));
          console.log(`📦 Moved to ${processedDir}`);
        } else {
          console.error(`❌ Upload failed [${res.statusCode}]: ${body}`);
        }
      });
    });

    req.on("error", (err) => console.error(`❌ Request error: ${err.message}`));
    req.write(fileData);
    req.end();
  } catch (err) {
    console.error(`❌ Error processing ${fileName}:`, err);
  }
});

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".txt": "text/plain",
  };
  return map[ext] || "application/octet-stream";
}

function buildMultipart(boundary: string, name: string, mime: string, buf: Buffer): Buffer {
  const header = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\nContent-Type: ${mime}\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  return Buffer.concat([header, buf, footer]);
}

console.log("\nPress Ctrl+C to stop.\n");

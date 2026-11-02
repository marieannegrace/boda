import nextEnv from "@next/env";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";

nextEnv.loadEnvConfig(process.cwd());
const root = path.resolve("out");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const portIndex = process.argv.indexOf("--port");
const port = Number(portIndex === -1 ? 3000 : process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid --port");
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".mp4": "video/mp4", ".vtt": "text/vtt",
  ".weba": "audio/webm", ".mp3": "audio/mpeg", ".m4a": "audio/mp4",
};
await stat(root);

const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const url = new URL(request.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    let status = 200;
    let file;
    if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
      status = 404;
    } else {
      file = path.resolve(root, `.${pathname.slice(basePath.length) || "/"}`);
      const relative = path.relative(root, file);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        response.writeHead(400).end("Invalid path");
        return;
      }
      try {
        const info = await stat(file);
        if (info.isDirectory()) {
          if (!url.pathname.endsWith("/")) {
            response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
            return;
          }
          file = path.join(file, "index.html");
        }
      } catch (error) {
        if (["ENOENT", "ENOTDIR"].includes(error.code)) status = 404;
        else throw error;
      }
    }
    if (status === 404) file = path.join(root, "404.html");
    const type = types[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    if (status === 200 && /^(video|audio)\//.test(type)) {
      const { size } = await stat(file);
      const headers = { "Content-Type": type, "Accept-Ranges": "bytes" };
      let start = 0;
      let end = size - 1;
      if (request.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
        if (range && (range[1] || range[2])) {
          start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
          end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
        } else start = size;
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) {
          response.writeHead(416, { ...headers, "Content-Range": `bytes */${size}` }).end();
          return;
        }
        status = 206;
        headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
      }
      response.writeHead(status, { ...headers, "Content-Length": end - start + 1 });
      if (request.method === "HEAD") response.end();
      else createReadStream(file, { start, end }).on("error", (error) => {
        console.error("Media stream failed:", error);
        response.destroy(error);
      }).pipe(response);
      return;
    }
    const data = await readFile(file);
    response.writeHead(status, { "Content-Type": type });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch (error) {
    console.error("Static preview request failed:", error);
    response.writeHead(error instanceof URIError ? 400 : 500).end("Unable to serve request");
  }
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Static export ready at http://127.0.0.1:${port}${basePath}/`);
});

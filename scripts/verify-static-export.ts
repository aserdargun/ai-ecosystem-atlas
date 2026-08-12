import { constants } from "node:fs";
import { access, readdir } from "node:fs/promises";

async function requireReadablePath(path: string): Promise<void> {
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(`Static export is missing required path: ${path}`);
  }
}

await requireReadablePath("out/index.html");
await requireReadablePath("out/_next/static");

const staticEntries = await readdir("out/_next/static");
if (staticEntries.length === 0) {
  throw new Error("Static export contains no Next.js static assets.");
}

console.log(
  `Static export verified: out/index.html and ${staticEntries.length} asset group(s).`,
);

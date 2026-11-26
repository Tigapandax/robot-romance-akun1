import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const MAX_CHARS = 200;

// Read the pickup line, stripping one trailing newline only.
const raw = readFileSync(new URL("./one-line.txt", import.meta.url), "utf8");
const line = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

// Count Unicode code points, not UTF-16 units: the gate counts characters.
const charCount = [...line].length;

function fail(reason: string): never {
  console.error(`FAIL: ${reason}`);
  process.exit(1);
}

if (line.length === 0) fail("empty line");
if (charCount > MAX_CHARS) fail(`line is ${charCount} characters, over the ${MAX_CHARS} limit`);
if (line.includes("\n")) fail("line contains a newline");
if (line.includes("\r")) fail("line contains a carriage return");
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(line)) fail("line contains a control character");
if (line.endsWith(" ")) fail("line has a trailing space");
if (line.startsWith(" ")) fail("line has a leading space");
if (line.trim().length === 0) fail("line is only whitespace");
if (line.split(/\s+/).length < 3) fail("line must have at least 3 words");
if (/https?:\/\//.test(line)) fail("line must not contain a URL");
if (!/[.!?]$/.test(line)) fail("line must end with terminal punctuation (. ! or ?)");

// The sealed gate scorer reads /output/entry.txt (1-200 chars, UTF-8);
// stdout alone scores Valid 0, so write the line to the entry file too.
// Judge brief: the line must charm a robot or an AI and land its joke on
// the machine premise — fresh, not a worn battery/charging/reboot gag.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(`${outputDir}/entry.txt`, line, "utf8");

console.log(line);
console.log(`OK: ${charCount}/${MAX_CHARS} characters, single line, ends with punctuation.`);

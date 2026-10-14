// Mirrors ../assets (logos, photography, illustration, icons) into
// public/brand so pages can reference /brand/... . The files in ../assets
// stay the source of truth: agents and other tools read them from there.
//   dev   → a symlink, so images generated mid-session show up on reload
//   build → a real copy, so the static export is self-contained
import { cpSync, existsSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const from = join(here, "..", "..", "assets");
const to = join(here, "..", "public", "brand");
const link = process.argv.includes("--link");

rmSync(to, { recursive: true, force: true });
if (!existsSync(from)) {
  console.log("no ../assets folder yet — skipping");
} else if (link) {
  symlinkSync(from, to, "dir");
  console.log("public/brand → ../assets (linked)");
} else {
  cpSync(from, to, { recursive: true });
  console.log("brand assets → public/brand (copied)");
}

// Icons are rendered at build time from Iconify's open sets, so any library
// picked on the icon board works here: set tokens.icon.iconify.prefix (and
// .suffix for a weight, e.g. Phosphor "-light"), then
//   npm i -E @iconify-json/<prefix>
// Nothing is fetched at runtime; the SVG is inlined in the page.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getIconData, iconToSVG, replaceIDs } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/types";
import { dig } from "@/lib/tokens";

const sets = new Map<string, IconifyJSON | null>();

function load(prefix: string): IconifyJSON | null {
  if (!sets.has(prefix)) {
    try {
      // Read from the site's own node_modules: module resolution inside the
      // server bundle points elsewhere, the working directory does not.
      const file = join(process.cwd(), "node_modules", "@iconify-json", prefix, "icons.json");
      sets.set(prefix, JSON.parse(readFileSync(file, "utf-8")));
    } catch {
      sets.set(prefix, null);
    }
  }
  return sets.get(prefix)!;
}

export function Icon({ name, size = 24, stroke }: { name: string; size?: number; stroke?: number }) {
  const prefix: string = dig("icon.iconify.prefix") ?? "lucide";
  const suffix: string = dig("icon.iconify.suffix") ?? "";
  const set = load(prefix);
  const data = set && (getIconData(set, name + suffix) ?? getIconData(set, name));
  if (!data) {
    return <span className="icon-missing" style={{ width: size, height: size }} title={`No icon "${name}" in ${prefix}`}>?</span>;
  }
  const svg = iconToSVG(data, { height: size });
  let body = replaceIDs(svg.body);
  // Stroke-based sets (Lucide, Tabler) take the brand's stroke; weight-based
  // sets (Phosphor) encode it in the suffix instead and have no stroke-width.
  const w = stroke ?? Number(dig("icon.stroke_width") ?? 0);
  if (w) body = body.replace(/stroke-width="[^"]*"/g, `stroke-width="${w}"`);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={svg.attributes.viewBox}
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: body }} />
  );
}

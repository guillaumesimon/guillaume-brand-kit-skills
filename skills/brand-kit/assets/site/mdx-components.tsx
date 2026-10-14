// Makes every kit component available in every .mdx page without an import.
import type { MDXComponents } from "mdx/types";
import * as kit from "@/components/kit";
import { SectionBar, Pager, CopyButton } from "@/components/client";
import { Icon } from "@/components/icon";
import { t } from "@/lib/tokens";

const components = {
  ...kit,
  SectionBar: () => <SectionBar label={t.onThisPage} />,
  Pager,
  CopyButton,
  Icon,
} as unknown as MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}

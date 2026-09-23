/**
 * The copied documents, as rendered markdown.
 *
 * Read here rather than in each page so the pages that need a document's
 * heading, and the page that renders its body, take both from the same file.
 * The heading is the document's own `#` line: restating it in the list in
 * docs.ts would be a second copy that drifts the first time the repository
 * renames a document.
 */

import type { MarkdownInstance } from 'astro';
import { DOCS } from './docs';

const FILES = import.meta.glob<MarkdownInstance<{ source: string }>>('../docs/*.md', {
  eager: true,
});

export interface DocFile {
  /** The rendered body, ready for the page. */
  readonly html: () => Promise<string>;
  /** The document's own title, from its first-level heading. */
  readonly headline: string;
}

/**
 * A markdown table column aligned right renders with `style="text-align: right"`
 * on every cell, which the site's style-src 'self' refuses. Those columns are
 * numbers, so they get the class the site's own numeric tables use and the
 * stylesheet aligns them. Left and centre alignment are dropped, since left is
 * the default and nothing here centres a column on purpose.
 */
function withoutInlineStyles(html: string): string {
  return html
    .replace(/ style="text-align: ?right;?"/g, ' class="num"')
    .replace(/ style="text-align: ?(?:left|center);?"/g, '');
}

export function docFile(slug: string): DocFile {
  const file = FILES[`../docs/${slug}.md`];
  if (file === undefined) {
    throw new Error(`src/docs/${slug}.md is missing. Run \`pnpm sync:docs\`.`);
  }
  const headline = file.getHeadings().find((one) => one.depth === 1)?.text;
  if (headline === undefined) {
    throw new Error(`src/docs/${slug}.md has no first-level heading to title the page with`);
  }
  return { html: async () => withoutInlineStyles(await file.compiledContent()), headline };
}

/** Every listed document's headline, keyed by slug. */
export function headlines(): Record<string, string> {
  return Object.fromEntries(DOCS.map((doc) => [doc.slug, docFile(doc.slug).headline]));
}

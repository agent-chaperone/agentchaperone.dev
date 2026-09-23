/**
 * The reference documents this site serves, listed once.
 *
 * The text of each lives in the tool's repository and is copied into src/docs
 * by scripts/sync-docs.mjs, which CI runs to prove the copy still matches. This
 * list owns only what the page around the text needs: the address, the title,
 * the description, and one line for the index and llms.txt. The slugs here and
 * the slugs in that script name the same files, and a slug with no file behind
 * it fails the build rather than shipping an empty page.
 */

import { SITE } from './guides';

export interface Doc {
  /** The path under /docs, which is also the file name under src/docs. */
  readonly slug: string;
  /** The path in the repository the text is copied from. */
  readonly source: string;
  /** The tab title. Carries the project name, because a citation carries this string. */
  readonly title: string;
  /** The meta description, and the summary a machine reader gets. */
  readonly description: string;
  /** One line for the index and for llms.txt, written to be read out of context. */
  readonly blurb: string;
}

export const DOCS: readonly Doc[] = [
  {
    slug: 'design',
    source: 'docs/design.md',
    title: 'Design | agent-chaperone',
    description:
      'How agent-chaperone works: what the proxy intercepts, every screening question and its wording, the policy file, the audit log, and what leaves the machine.',
    blurb:
      'The architecture, each screen and the exact questions it asks, how a decision is made from the answers, the policy file, the audit log, and what content leaves the machine.',
  },
  {
    slug: 'hooks',
    source: 'docs/hooks.md',
    title: 'Hooks reference | agent-chaperone',
    description:
      "The reference for agent-chaperone's hooks adapter: the Claude Code configuration, what each hook command answers, and what hooks cannot see.",
    blurb:
      "Screening a client's own shell, file edits and fetches: the configuration, what each hook command answers, how a withheld result keeps the shape a tool returns, and what hooks cannot see.",
  },
  {
    slug: 'benchmark',
    source: 'bench/README.md',
    title: 'Benchmark method | agent-chaperone',
    description:
      "How agent-chaperone's screening questions were measured: the datasets, the hand-labeled calls, and how to reproduce the scores without a key.",
    blurb:
      'The public datasets and hand-labeled tool calls the questions were measured against, the recorded model responses, the limits of the numbers, and how to reproduce them without a key.',
  },
];

export function docUrl(doc: Doc): string {
  return `${SITE}/docs/${doc.slug}`;
}

export function findDoc(slug: string): Doc {
  const found = DOCS.find((one) => one.slug === slug);
  if (found === undefined) {
    throw new Error(`No document is listed under the slug "${slug}"`);
  }
  return found;
}

/**
 * Copy the reference documents from the tool's repository into this site.
 *
 * The documents are written and reviewed in the repository, next to the code
 * they describe, and that stays their only source. This site serves a copy so a
 * reader lands on agentchaperone.dev rather than on a GitHub page, and a copy is
 * only worth serving if it cannot quietly disagree with the original. So the
 * copy is made by this script and never by hand, and CI runs it with `--check`,
 * which fails when the committed copy is not what the repository's main branch
 * says today.
 *
 *     node scripts/sync-docs.mjs           write src/docs/*.md
 *     node scripts/sync-docs.mjs --check   fail if they differ from main
 *
 * The one change made on the way in is to links. A relative link in the
 * repository points at a file beside the document; here it points at the page
 * that serves that file, or at the file on GitHub when this site does not serve it.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { posix } from 'node:path';

const REPO = 'https://github.com/agent-chaperone/agent-chaperone';
const RAW = 'https://raw.githubusercontent.com/agent-chaperone/agent-chaperone/main';

/** What this site serves, keyed by the path in the repository. */
const DOCS = [
  { slug: 'hooks', source: 'docs/hooks.md' },
  { slug: 'design', source: 'docs/design.md' },
  { slug: 'benchmark', source: 'bench/README.md' },
];

const SERVED = new Map(DOCS.map((doc) => [doc.source, `/docs/${doc.slug}`]));

/** Where a link in a document at `source` should point on this site. */
function target(source, href) {
  if (/^[a-z]+:/i.test(href) || href.startsWith('#')) {
    const own = `${REPO}/blob/main/`;
    if (!href.startsWith(own)) {
      return href;
    }
    // An absolute link to one of the served documents is still a link to it.
    const [path, anchor] = href.slice(own.length).split('#');
    const page = SERVED.get(path);
    return page === undefined ? href : `${page}${anchor === undefined ? '' : `#${anchor}`}`;
  }
  const [relative, anchor] = href.split('#');
  const path = posix.normalize(posix.join(posix.dirname(source), relative));
  const suffix = anchor === undefined ? '' : `#${anchor}`;
  const page = SERVED.get(path);
  if (page !== undefined) {
    return `${page}${suffix}`;
  }
  // A directory reads as a tree on GitHub and a file as a blob.
  const kind = /\.[a-z0-9]+$/i.test(posix.basename(path)) ? 'blob' : 'tree';
  return `${REPO}/${kind}/main/${path}${suffix}`;
}

function copyOf(doc, text) {
  // Links inside fenced code are code, not links, so fences are left alone.
  const parts = text.split(/(^```[\s\S]*?^```)/m);
  const body = parts
    .map((part) =>
      part.startsWith('```')
        ? part
        : part.replace(/\]\(([^)\s]+)\)/g, (_, href) => `](${target(doc.source, href)})`),
    )
    .join('');
  const front = [
    '---',
    `source: ${doc.source}`,
    '# Copied from the repository by scripts/sync-docs.mjs. Edit the original there.',
    '---',
    '',
  ].join('\n');
  return `${front}${body}`;
}

async function fetched(doc) {
  const response = await fetch(`${RAW}/${doc.source}`);
  if (!response.ok) {
    throw new Error(`${doc.source}: HTTP ${response.status} from ${RAW}`);
  }
  return response.text();
}

async function main() {
  const check = process.argv.includes('--check');
  let stale = 0;
  for (const doc of DOCS) {
    const wanted = copyOf(doc, await fetched(doc));
    const file = `src/docs/${doc.slug}.md`;
    if (!check) {
      writeFileSync(file, wanted);
      console.log(`${doc.source} -> ${file}`);
      continue;
    }
    let committed = '';
    try {
      committed = readFileSync(file, 'utf8');
    } catch {
      // Missing is the same failure as different.
    }
    if (committed !== wanted) {
      console.error(`${file} is not what ${doc.source} says on main.`);
      stale += 1;
    }
  }
  if (stale > 0) {
    console.error('Run `pnpm sync:docs` and commit the result.');
    process.exit(1);
  }
  if (check) {
    console.log(`All ${DOCS.length} documents match the repository.`);
  }
}

await main();

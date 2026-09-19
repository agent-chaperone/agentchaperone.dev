/**
 * A markdown twin of every built page.
 *
 * An assistant fetching a page gets markup it has to strip before it can read
 * anything, and what it strips is the part carrying the meaning: which text was
 * a heading, which was a table cell, which was a link. Serving the same content
 * as markdown hands it the structure instead of making it infer one.
 *
 * Generated from the built HTML rather than written by hand, because a twin
 * that drifts from the page is worse than no twin: it says something the site
 * does not, with the site's authority. Nothing here is a second source of
 * truth; the pages remain the only one.
 *
 * Run after `astro build`. Writes dist/index.md beside dist/index.html.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITE = 'https://agentchaperone.dev';

/** Entities the pages actually produce, decoded so the markdown reads as text. */
const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
  '&mdash;': '-',
  '&ndash;': '-',
};

function decode(text) {
  return text.replace(/&[a-z#0-9]+;/gi, (found) => ENTITIES[found] ?? found);
}

/** Tags stripped to their text, with the markdown that carries the same meaning. */
function inline(html) {
  return decode(
    html
      .replace(/<code[^>]*>(.*?)<\/code>/gis, (_, inner) => `\`${inner.replace(/<[^>]*>/g, '')}\``)
      .replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gis, '**$1**')
      .replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gis, '_$1_')
      // A link keeps its destination. Relative ones are made absolute, since a
      // reader of the markdown has no page to resolve them against.
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, (_, href, text) => {
        const clean = text.replace(/<[^>]*>/g, '').trim();
        if (clean === '' || clean === '#') {
          return '';
        }
        const url = href.startsWith('/') ? `${SITE}${href}` : href;
        return url.startsWith('#') ? clean : `[${clean}](${url})`;
      })
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function cells(row, tag) {
  return [...row.matchAll(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'gis'))].map((m) =>
    inline(m[1]).replace(/\|/g, '\\|'),
  );
}

/** One table, as a markdown table. The tables here carry the numbers. */
function table(html) {
  const rows = [...html.matchAll(/<tr[^>]*>(.*?)<\/tr>/gis)].map((m) => m[1]);
  if (rows.length === 0) {
    return '';
  }
  const head = cells(rows[0], 'th');
  const body = rows.slice(head.length > 0 ? 1 : 0).map((row) => cells(row, 'td'));
  const width = Math.max(head.length, ...body.map((r) => r.length), 1);
  const pad = (r) => [...r, ...Array(width - r.length).fill('')];
  const out = [];
  out.push(`| ${pad(head.length > 0 ? head : Array(width).fill('')).join(' | ')} |`);
  out.push(`| ${Array(width).fill('---').join(' | ')} |`);
  for (const row of body) {
    if (row.length > 0) {
      out.push(`| ${pad(row).join(' | ')} |`);
    }
  }
  return out.join('\n');
}

function convert(html) {
  const main = /<main[^>]*>(.*?)<\/main>/is.exec(html)?.[1] ?? '';
  const out = [];

  // Block elements in the order they appear, so the twin reads in page order.
  const blocks = main.matchAll(
    /<(h1|h2|h3|h4|p|pre|ul|ol|table)\b[^>]*>(.*?)<\/\1>/gis,
  );

  for (const [, tag, inner] of blocks) {
    if (tag === 'pre') {
      const code = decode(inner.replace(/<[^>]*>/g, '')).trim();
      out.push(`\`\`\`\n${code}\n\`\`\``);
      continue;
    }
    if (tag === 'table') {
      const rendered = table(inner);
      if (rendered !== '') {
        out.push(rendered);
      }
      continue;
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = [...inner.matchAll(/<li[^>]*>(.*?)<\/li>/gis)]
        .map((m) => inline(m[1]))
        .filter((one) => one !== '');
      if (items.length > 0) {
        out.push(items.map((one, at) => (tag === 'ol' ? `${at + 1}. ${one}` : `- ${one}`)).join('\n'));
      }
      continue;
    }
    const text = inline(inner);
    if (text === '') {
      continue;
    }
    const level = { h1: '# ', h2: '## ', h3: '### ', h4: '#### ' }[tag] ?? '';
    out.push(`${level}${text}`);
  }

  return out.join('\n\n');
}

function main() {
  const pages = readdirSync(DIST).filter((name) => name.endsWith('.html') && name !== '404.html');
  let written = 0;
  for (const page of pages) {
    const html = readFileSync(join(DIST, page), 'utf8');
    const title = /<title>(.*?)<\/title>/is.exec(html)?.[1] ?? '';
    const description = /<meta name="description" content="([^"]*)"/i.exec(html)?.[1] ?? '';
    const path = page === 'index.html' ? '/' : `/${page.replace(/\.html$/, '')}`;
    const body = convert(html);

    if (body.length < 200) {
      // A twin that is nearly empty means the conversion missed the content, and
      // shipping it would tell a reader this page says almost nothing.
      throw new Error(`${page}: the markdown twin came out empty, so the conversion is wrong`);
    }

    const front = [
      `<!-- Generated from ${path} by scripts/make-markdown.mjs. The page is the source. -->`,
      '',
      body,
      '',
      '---',
      '',
      `Source: ${SITE}${path}`,
      decode(description) === '' ? '' : decode(description),
    ]
      .filter((one) => one !== undefined)
      .join('\n');

    writeFileSync(join(DIST, page.replace(/\.html$/, '.md')), `${front}\n`);
    written += 1;
    console.log(`${path} -> ${page.replace(/\.html$/, '.md')} (${body.length} chars, "${title}")`);
  }
  if (written === 0) {
    throw new Error('no pages were converted, which means dist/ was not built');
  }
}

main();

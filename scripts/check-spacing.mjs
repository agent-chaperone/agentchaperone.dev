/**
 * Fail the build when a word runs straight into an inline tag.
 *
 * Astro collapses the newline between text and a following element, so a line
 * break before a <code> or an <a> silently eats the space and ships
 * "one run ofjev-1.13.0". It reads as a typo rather than as a template bug, and
 * it is invisible in the source, so it is checked in the output instead.
 *
 * The heading anchor links are the one place a tag legitimately touches a word.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TAGS = 'code|a|strong|em|b|i';
const BEFORE = new RegExp(`([A-Za-z0-9.,;:)])(<(?:${TAGS})\\b(?![^>]*class="anchor")[^>]*>)`, 'g');
const AFTER = new RegExp(`(</(?:${TAGS})>)([A-Za-z0-9(])`, 'g');

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

let found = 0;
for (const file of htmlFiles('dist')) {
  const html = readFileSync(file, 'utf8');
  for (const rx of [BEFORE, AFTER]) {
    for (const m of html.matchAll(rx)) {
      const around = html
        .slice(Math.max(0, m.index - 60), m.index + m[0].length + 45)
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      console.error(`${file}: missing space ... ${around} ...`);
      found += 1;
    }
  }
}

if (found > 0) {
  console.error(`\n${found} place(s) where a word runs into a tag. Add {' '} before the tag.`);
  process.exit(1);
}
console.log('Spacing around inline tags is fine.');

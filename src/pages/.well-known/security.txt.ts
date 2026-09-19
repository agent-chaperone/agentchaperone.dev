import type { APIRoute } from 'astro';
import { REPO } from '../../data/benchmark';

/**
 * Generated at build rather than committed, because RFC 9116 requires an expiry
 * and a date typed into a file goes quietly invalid. Built a year out from
 * whenever the site was last built, so a deploy is what renews it.
 *
 * Contact is the advisory form rather than an address, which also keeps an email
 * out of a published file.
 */
export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d+Z$/, 'Z');
  const body = [
    `Contact: ${REPO}/security/advisories/new`,
    `Policy: ${REPO}/blob/main/SECURITY.md`,
    `Expires: ${expires}`,
    'Preferred-Languages: en',
    'Canonical: https://agentchaperone.dev/.well-known/security.txt',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
